import type { RollupOptions, OutputChunk } from "rollup";
import { web_module, ModuleConfig } from "./adapter/web_module";
import { useRollup } from "./Compiler/rollup";
import { useGlobal } from "./utils/useGlobal";
import { createModuleCache } from "./Cache";
import { fetchHook } from "./Compiler/fetchHook";
import { Plugin, RollupCache } from "rollup-web";
import { bareURL, URLResolve } from "./utils/isURLString";
import { Setting } from "./Setting";
import { isInWorker } from "./utils/createWorker";
import { expose, proxy } from "comlink";
import { LocalCache } from "./Cache/LocalCache";
import { log } from "./utils/ColorConsole";
import { WebFetcher } from "./adapter/Fetcher/WebFetcher";
/**
 * 缓存配置项
 */
export type CacheConfig = {
    /*  设置忽略缓存的域 */
    ignore?: string[];
    root?: string;
    /* 以秒计算的缓存生命时间 */
    maxAge?: number;
};

/* 
    备忘录：
    1. 模块 id 系统： 
        1. id 为 URL 形式，
        2. 但是不能够填入 hash 值，
        3. queryParams 可以作为参数传递信息，传递信息会算作 id 的一部分进行缓存
*/
export type CompilerModuleConfig = ModuleConfig & {
    /* 匹配到的区域都将使用 rollup 打包 */
    useDataCache?: false | CacheConfig;
    autoBuildFetchHook?: boolean;
};
type ImportTool = (url: string) => void | Promise<void>;

/* Compiler 是一个浏览器打包环境，需要 systemjs 支持 */
export class Compiler {
    System = useGlobal<any>("System");
    inWorker = isInWorker();
    constructor(
        /* input and output will be ignored */
        public options: RollupOptions,

        /**
         *  需要打包模块的解析配置
         *  @property extraBundle 若为 true，将会把 远程代码下载并经过 rollup 打包;若为 Array，将会打包区域内的代码; root 下的代码是必定被打包的，所以不用填;
         *  @property useDataCache 使用 indexDB 进行打包代码缓存以提高速度
         */
        public moduleConfig: CompilerModuleConfig
    ) {
        if (!this.moduleConfig.root) {
            this.moduleConfig.root = bareURL(globalThis.location.href);
        }
        this.moduleCache =
            moduleConfig.useDataCache === undefined ||
            moduleConfig.useDataCache === false
                ? (new Map<string, string>() as any as LocalCache)
                : createModuleCache(moduleConfig.useDataCache);

        this.refreshPlugin();
    }
    plugins: Plugin[] = [];
    /* 更新插件配置 */
    refreshPlugin() {
        this.plugins = this.options.plugins as Plugin[];
        this.plugins.push(
            web_module({
                ...this.moduleConfig,
                forceDependenciesExternal: true,
            })
        );
    }
    /* 打包缓存，code import 被替换为指定的 url 标记 */
    moduleCache!: LocalCache;

    getModuleConfig() {
        return JSON.stringify(this.moduleConfig);
    }

    reporter = {
        lastEvaluate: {
            time: 0,
        },
    };
    /**
     * 执行代码
     * @param importTool 用于线程调用的额外选项，可以替换与 systemjs 的交互
     * */
    evaluate<T = any>(path: string, importTool: ImportTool): Promise<void>;
    evaluate<T = any>(path: string): Promise<T>;
    async evaluate<T = any>(
        path: string,
        importTool?: ImportTool
    ): Promise<unknown> {
        console.group("Bundling Code ", path);

        const url = URLResolve(path, this.moduleConfig.root!);

        const isExist = await this.moduleCache.has(url);
        if (!isExist) await this.CompileSingleFile(url);

        if (this.inWorker && !importTool) {
            // 在线程中若没有环境则直接报错
            throw new Error(
                "Rollup-web | Compiler in worker must use Evaluator to evaluate"
            );
        }

        if (importTool) {
            // 在 worker 线程中，使用线程的回调函数返回数据
            await importTool(url);
            console.groupEnd();
            this.reporter.lastEvaluate.time = Date.now();
            return; // 不返回数据
        } else {
            // 主线程中的操作
            let System = useGlobal<any>("System");
            if (!System) {
                throw new Error(
                    "Compiler | evaluate : You need a Evaluator to start! "
                );
            }
            System = useGlobal<any>("System");
            const result: T = System.import(url);
            console.groupEnd();
            this.reporter.lastEvaluate.time = Date.now();
            return result;
        }
    }
    RollupCache: RollupCache = {
        modules: [],
        plugins: {},
    };

    /* 编译之前的检查缓存环节 */
    async checkCache(url: string) {
        const isCached = await this.moduleCache.has(url);

        if (isCached) {
            const hasNewer = await (
                this.moduleConfig.adapter || WebFetcher
            ).isNew(url, this.reporter.lastEvaluate.time);
            if (hasNewer) return false;
            log.green(` System fetch | cache ` + url);
            return (await this.moduleCache.get(url)) || "";
        }
        return false;
    }
    /* 编译单个代码，不宜单独使用 */
    async CompileSingleFile(url: string): Promise<string> {
        const bundled = await this.checkCache(url);
        if (bundled) return bundled;
        return useRollup({
            ...this.options,
            input: url,
            plugins: this.plugins,
            output: {
                format: "system",
            },
            cache: this.RollupCache,
        }).then((res) => {
            let code: string = "";
            res.output.forEach((i) => {
                const info = i as OutputChunk;
                if (info.isEntry) {
                    code = info.code;
                    this.moduleCache.set(url, info.code);
                } else {
                    this.moduleCache.set(info.facadeModuleId!, info.code);
                }
            });
            log.pink(` System fetch | bundle ` + url);
            return code;
        });
    }

    // TODO Compiler 线程 插件数据存储问题
    /**
     * 在 worker 线程中启动，将自身导出为 comlink 接口
     * @params force 强制使用 force 模式
     */
    useWorker(
        /* 强制开启 comlink worker 端口 */
        force = false
    ) {
        if (force || this.inWorker) {
            expose(proxy(this));
            globalThis.postMessage("__rollup_web_ready__");
            return true;
        } else {
            return false;
        }
    }
}
