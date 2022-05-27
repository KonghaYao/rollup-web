import type { RollupOptions, OutputChunk } from "rollup";
import { web_module, ModuleConfig } from "./adapter/web_module";
import { useRollup } from "./rollup";
import { useGlobal } from "./utils/useGlobal";
import pm from "picomatch";
import { loadScript } from "./utils/loadScript";

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
        const isExist = await moduleCache.hasData(url);
        if (isExist) {
            /* 已经存在缓存 */
            console.log(
                "%c Compiler | fetch | cache " + url,
                "background-color:#00aa0011;"
            );
            code = (await moduleCache.getData(url))!.code;
        } else if (moduleConfig.allBundle || isMatch(url)) {
            console.log(
                "%c Compiler | fetch | bundle " + url,
                "background-color:#77007711;"
            );
            /* 全打包或者被选中打包 */
            code = await Bundle(url, rollupCode, moduleCache);
        } else {
            /* 默认使用 esm import 方式导入代码 */
            console.log(
                "%c Compiler | fetch | import " + url,
                "background-color:#00007711;"
            );
            code = await LoadEsmModule(url);
        }
        return new Response(
            new Blob([code], {
                type: "application/javascript",
            })
        );
    };
};

class ModuleCache<T, E> extends Map<T, E> {
    set(key: T, value: E): this {
        if (this.store) {
            this.store.setItem(key, value);
        }
        return super.set.call(this, key, value);
    }
    store!: any;
    async registerCache() {
        await loadScript(
            "https://fastly.jsdelivr.net/npm/localforage/dist/localforage.min.js"
        );
        const localforage = useGlobal<any>("localforage");
        // Feel free to change the drivers order :)
        this.store = localforage.createInstance({
            name: "rollup_web",
            driver: [
                localforage.INDEXEDDB,
                localforage.WEBSQL,
                localforage.LOCALSTORAGE,
            ],
        });
    }
    async hasData(key: T): Promise<boolean> {
        if (this.store) {
            return this.store.keys().then((res: T[]) => {
                return res.includes(key);
            });
        }
        return super.has.call(this, key);
    }
    async getData(key: T): Promise<E | undefined> {
        if (this.store) {
            const data = await this.store.getItem(key);
            if (data) return data;
        }
        return super.get.call(this, key);
    }
}

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
            useDataCache?: boolean;
        }
    ) {
        if (!this.moduleConfig.root) {
            this.moduleConfig.root = globalThis.location.href.replace(
                /[^\/]*?#.*/,
                ""
            );
        }
        if (moduleConfig.useDataCache) this.moduleCache.registerCache();
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
    moduleCache: ModuleCache<string, OutputChunk>
) {
    /* 副作用： 打包，打包过后是会有缓存的 */
    await rollupCode()(url);
    return moduleCache.getData(url).then((res) => res!.code);
}
