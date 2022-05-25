import { RollupOptions, OutputChunk, Plugin } from "rollup-web";
import { web_module, ModuleConfig } from "./adapter/web_module";
import { useRollup } from "./rollup";
import { useGlobal } from "./utils/useGlobal";
import pm from "picomatch";

// 用于和 Systemjs 进行互动
const fetchHook = (
    moduleCache: Compiler["moduleCache"],
    moduleConfig: Compiler["moduleConfig"],
    rollupCode: () => (code: string, replaceUrl?: string) => Promise<any>
) => {
    const System = useGlobal<any>("System");

    // 记录 esm import 之后的 Module 的导入代码
    System.constructor.prototype._esm_module_ = new Map<string, string>();
    System.shouldFetch = () => true;

    console.log("fetch hook 注入成功");
    const hookName = "fetch";
    /* 匹配到具体的 bundleArea */
    const isMatch = (url: string) => {
        return (moduleConfig.bundleArea || []).some((i) => pm(i)(url));
    };
    System.constructor.prototype[hookName] = async function (
        ...args: [string, any]
    ) {
        const [url] = args;
        let code: string;

        if (moduleCache.has(url)) {
            /* 已经存在缓存 */
            console.log("%c cache " + url, "color:green");
            code = moduleCache.get(url)!.code;
        } else if (moduleConfig.allBundle || isMatch(url)) {
            console.log("%c bundle " + url, "color:orange");
            /* 全打包或者被选中打包 */
            code = await Bundle(url, rollupCode, moduleCache);
        } else {
            /* 默认使用 esm import 方式导入代码 */
            console.log("%c import " + url, "color:blue");
            code = await LoadEsmModule(url);
        }
        return new Response(
            new Blob([code], {
                type: "application/javascript",
            })
        );
    };
};
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
        }
    ) {
        fetchHook(this.moduleCache, this.moduleConfig, () => {
            return this.CompileSingleFile.bind(this);
        });
    }
    /* 打包缓存，code import 被替换为指定的 url 标记 */
    moduleCache = new Map<string, OutputChunk>();

    /* 执行代码 */
    async evaluate(path: string) {
        const System = useGlobal<any>("System");
        const url = new URL(path, this.moduleConfig.root).toString();
        if (!this.moduleCache.has(url)) {
            await this.CompileSingleFile(url);
        }
        return System.import(url);
    }
    isLocalFile(url: string) {
        return url.startsWith(this.moduleConfig.root!);
    }

    /* 编译单个代码，不宜单独使用 */
    async CompileSingleFile(url: string, replaceUrl?: string) {
        return useRollup({
            ...this.options,
            input: url,
            plugins: (this.options.plugins || []).concat(
                web_module({
                    ...this.moduleConfig,
                    forceDependenciesExternal: true,
                })
            ),
            output: {
                format: "system",
            },
        }).then((res) => {
            (res.output as OutputChunk[]).forEach((i) => {
                this.moduleCache.set(replaceUrl || i.facadeModuleId!, i);
            });
            return res.output;
        });
    }
}

/*   产生副作用，下载模块，并加入 System 缓存中 */
async function LoadEsmModule(url: string) {
    const System = useGlobal<any>("System");
    if (!System._esm_module_.has(url)) {
        // import 数据并加入全局缓存
        await import(url).then((module) => {
            System._esm_module_.set(url, module);
        });
    }
    return `System.register([],function(exports){
                return {
                    setters: [],
                    execute:function(){
                        const module =  globalThis.System._esm_module_.get('${url}')
                        Object.entries(module).forEach(([key,value]) => {
                            exports(key,value)
                        });
                    }
                }
            })`;
}

/* 内部没有缓存，但是使用了全打包方式，下载代码并进行 rollup 解析 */
async function Bundle(
    url: string,
    rollupCode: () => (code: string, replaceUrl?: string) => Promise<any>,
    moduleCache: Map<string, OutputChunk>
) {
    /* 副作用： 打包，打包过后是会有缓存的 */
    await rollupCode()(url);
    return moduleCache.get(url)!.code;
}
