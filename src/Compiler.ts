import type { RollupOptions, OutputChunk } from "rollup";
import { web_module, ModuleConfig } from "./adapter/web_module";
import { useRollup } from "./Compiler/rollup";
import { useGlobal } from "./utils/useGlobal";
import { CacheConfig, ModuleCache } from "./Compiler/ModuleCache";
import { fetchHook } from "./Compiler/fetchHook";
import { Plugin, RollupCache } from "rollup-web";
import { bareURL, URLResolve } from "./utils/isURLString";

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
/* Compiler 是一个浏览器打包环境，需要 systemjs 支持 */
export class Compiler {
    System = useGlobal<any>("System");
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
        if (moduleConfig.useDataCache) {
            this.moduleCache.createConfig(
                typeof moduleConfig.useDataCache === "object"
                    ? moduleConfig.useDataCache
                    : {}
            );
            this.moduleCache.registerCache();
        }
        if (moduleConfig.autoBuildFetchHook ?? true)
            fetchHook(this.moduleCache, this.moduleConfig, () => {
                return this.CompileSingleFile.bind(this);
            });
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
    moduleCache = new ModuleCache<string, OutputChunk>();

    getModuleConfig() {
        return JSON.stringify(this.moduleConfig);
    }

    /**
     * 执行代码
     * @param importTool 用于线程调用的额外选项，可以替换与 systemjs 的交互
     * */
    async evaluate<T = any>(
        path: string,
        importTool?: (url: string) => void
    ): Promise<T> {
        console.group("Bundling Code ", path);
        const System = useGlobal<any>("System");
        const url = URLResolve(path, this.moduleConfig.root!);

        const isExist = this.moduleCache.hasData(url);
        if (!isExist) await this.CompileSingleFile(url);

        const runtime = importTool ? importTool : System.import.bind(System);
        // 注意，线程中由于 环境与打包分离，runtime 不会返回结果
        const result: T = await runtime(url);
        console.groupEnd();
        return result;
    }

    isLocalFile(url: string) {
        return url.startsWith(this.moduleConfig.root!);
    }
    RollupCache: RollupCache = {
        modules: [],
        plugins: {},
    };
    /* 编译单个代码，不宜单独使用 */
    async CompileSingleFile(url: string) {
        return useRollup({
            ...this.options,
            input: url,
            plugins: this.plugins,
            output: {
                format: "system",
            },

            cache: this.RollupCache,
        }).then((res) => {
            (res.output as OutputChunk[]).forEach((i) => {
                this.moduleCache.set(i.facadeModuleId!, i);
            });
            return res.output;
        });
    }
}
