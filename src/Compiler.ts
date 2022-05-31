import type { RollupOptions, OutputChunk } from "rollup";
import { web_module, ModuleConfig } from "./adapter/web_module";
import { useRollup } from "./rollup";
import { useGlobal } from "./utils/useGlobal";
import { CacheConfig, ModuleCache } from "./Compiler/ModuleCache";
import { fetchHook } from "./Compiler/fetchHook";
import { Plugin } from "rollup-web";

/* 
    备忘录：
    1. 模块 id 系统： 
        1. id 为 URL 形式，
        2. 但是不能够填入 hash 值，
        3. queryParams 可以作为参数传递信息，传递信息会算作 id 的一部分进行缓存
*/

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
        public moduleConfig: ModuleConfig & {
            extraBundle?: true | string[];
            /* 匹配到的区域都将使用 rollup 打包 */
            useDataCache?: false | CacheConfig;
        }
    ) {
        if (!this.moduleConfig.root) {
            this.moduleConfig.root = globalThis.location.href.replace(
                /[^\/]*?#.*/,
                ""
            );
        }
        if (moduleConfig.useDataCache) {
            this.moduleCache.createConfig(
                typeof moduleConfig.useDataCache === "object"
                    ? moduleConfig.useDataCache
                    : {}
            );
            this.moduleCache.registerCache();
        }
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

    /* 执行代码 */
    async evaluate(path: string) {
        const System = useGlobal<any>("System");
        const url = new URL(path, this.moduleConfig.root).toString();
        const isExist = this.moduleCache.hasData(url);
        if (!isExist) {
            await this.CompileSingleFile(url);
        }
        return System.import(url);
    }
    isLocalFile(url: string) {
        return url.startsWith(this.moduleConfig.root!);
    }

    /* 编译单个代码，不宜单独使用 */
    async CompileSingleFile(url: string) {
        return useRollup({
            ...this.options,
            input: url,
            plugins: this.plugins,
            output: {
                format: "system",
            },
        }).then((res) => {
            (res.output as OutputChunk[]).forEach((i) => {
                this.moduleCache.set(i.facadeModuleId!, i);
            });
            return res.output;
        });
    }
}
