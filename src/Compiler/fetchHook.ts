import type { OutputChunk } from "rollup";
import { isMatch } from "picomatch";
import { useGlobal } from "../utils/useGlobal";
import { ModuleCache } from "./ModuleCache";
import { Compiler } from "../Compiler";
import { log } from "../utils/ColorConsole";

/**
 * 用于和 Systemjs 进行互动,
 * fetch 只与第一次打包有关，
 * 如果后续再请求到同一个 url，那么会直接走缓存
 */
export const fetchHook = (
    moduleCache: Compiler["moduleCache"],
    moduleConfig: Compiler["moduleConfig"],
    rollupCode: () => (code: string) => Promise<any>
) => {
    const SystemJS = useGlobal<any>("System");

    // 记录 esm import 之后的 Module 的导入代码
    SystemJS.constructor.prototype._esm_module_ = new Map<string, any>();
    SystemJS.shouldFetch = () => true;

    const hookName = "fetch";

    SystemJS.constructor.prototype[hookName] = async function (
        ...args: [string, any]
    ) {
        const [url] = args;

        let code: string;
        const cacheUrl = await moduleCache.hasData(url.replace(/\?.*/, ""));

        /* 
        缓存对内，allBundle 对外，allBundle 是扩展打包的领域，而缓存是针对已经打包的领域进行加速
        */

        if (cacheUrl) {
            /* 已经存在缓存 */
            log.green("Compiler | fetch | cache " + cacheUrl);
            code = (await moduleCache.getData(cacheUrl))!.code;
        } else if (
            moduleConfig.extraBundle === true ||
            /* 如果没有设置打包区域，那么将全部打包 */
            (moduleConfig.extraBundle instanceof Array &&
                /* 如果设置了打包区域，那么将会按照这些进行打包 */
                isMatch(url, moduleConfig.extraBundle)) ||
            url.startsWith(moduleConfig.root!)
        ) {
            log.pink(` Compiler | fetch | bundle ` + url);
            /* 全打包或者被选中打包 */
            code = await Bundle(url, rollupCode, moduleCache);
        } else {
            /* 默认使用 esm import 方式导入代码 */
            log.blue(" Compiler | fetch | import " + url);
            code = await LoadEsmModule(url);
        }
        return new Response(
            new Blob([code], {
                type: "application/javascript",
            })
        );
    };
};
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
/* 
    内部没有缓存，但是使用了全打包方式，下载代码并进行 rollup 解析
*/
async function Bundle(
    url: string,
    rollupCode: () => (code: string) => Promise<OutputChunk[]>,
    moduleCache: ModuleCache<string, OutputChunk>
) {
    /* 副作用： 打包，打包过后是会有缓存的 */
    const result = await rollupCode()(url);

    // 从缓存中取出这个代码
    return result.find((i) => {
        return i.facadeModuleId!.startsWith(url);
    })!.code;
}
