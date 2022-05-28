import type { RollupOptions, OutputChunk } from "rollup";
import { web_module, ModuleConfig } from "./adapter/web_module";
import { useRollup } from "./rollup";
import { useGlobal } from "./utils/useGlobal";
import { CacheConfig, ModuleCache } from "./Compiler/ModuleCache";
import { fetchHook } from "./Compiler/fetchHook";

export class Compiler {
    System = useGlobal<any>("System");
    constructor(
        /* input and output will be ignored */
        public options: RollupOptions,
        /* config used in web_module */
        public moduleConfig: ModuleConfig & {
            /** 若为 true，将会把 远程代码下载并经过 rollup 打包，覆盖 bundleArea */
            allBundle?: boolean;
            /* 匹配到的区域都将使用 rollup 打包 */
            bundleArea?: string[];
            useDataCache?: boolean | CacheConfig;
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
        const plugins = this.options.plugins || [];
        plugins.push(
            web_module({
                ...this.moduleConfig,
                forceDependenciesExternal: true,
            })
        );
        return useRollup({
            ...this.options,
            input: url,
            plugins,
            output: {
                format: "system",
            },
        }).then((res) => {
            // 将结果写入缓存，url 可能会被添加上 searchParams
            (res.output as OutputChunk[]).forEach((i) => {
                this.moduleCache.set(i.facadeModuleId!.replace(/\?.*/, ""), i);
            });
            return res.output;
        });
    }
}
