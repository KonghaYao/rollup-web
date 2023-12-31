import { isMatch } from "picomatch";
import { useGlobal } from "../utils/useGlobal";
import type { Compiler } from "../Compiler";
import { log } from "../utils/ColorConsole";
import { environment, SystemJSProvider } from "./environment";
import { EnvTag } from "../utils/EnvCheck";

/* 判断执行器，当执行到 true 判断时，执行函数并退出 */
const RunMissions = async (
    missions: [() => boolean, () => void | Promise<void>][]
) => {
    for (let [canRun, exec] of missions) {
        if (canRun()) {
            await exec();
            break;
        }
    }
};
const createClosure = (code: string) => {
    return `(function (){${code}})()`;
};
/**
 * 用于和 Systemjs 进行互动,
 * fetch 只与第一次打包有关，
 * 如果后续再请求到同一个 url，那么会直接走缓存
 */
export const fetchHook = (
    moduleConfig: Compiler["moduleConfig"],
    rollupCode: (code: string) => Promise<string>,
    env: EnvTag
) => {
    const SystemJS = useGlobal<any>("__Rollup_Web_System__");

    // 环境覆盖参数
    const banner = environment({ config: moduleConfig }, env);

    // 记录 esm import 之后的 Module 的导入代码
    SystemJS._esm_module_ = new Map<string, any>();
    SystemJS.fetch = async function (url: string, options?: RequestInit) {
        let code!: string;
        const { extraBundle, ignore = [], root } = moduleConfig;

        const missions: [() => boolean, () => void | Promise<void>][] = [
            [
                () => isMatch(url, ignore),
                async () => {
                    /* 默认使用 esm import 方式导入代码 */
                    log.blue(" System fetch | import " + url);
                    code = await LoadEsmModule(url);
                },
            ],
            [
                () => {
                    return (
                        /* true 为全打包 */
                        extraBundle === true ||
                        /* 如果没有设置打包区域，那么将全部打包 */
                        (extraBundle instanceof Array &&
                            extraBundle.length &&
                            /* 如果设置了打包区域，那么将会按照这些进行打包 */
                            isMatch(url, extraBundle)) ||
                        url.startsWith(new URL(root!).origin)
                    );
                },
                async () => {
                    /* 全打包或者被选中打包 */
                    code = await rollupCode(url);
                },
            ],
            [
                () => true,
                async () => {
                    /* 默认使用 esm import 方式导入代码 */
                    log.blue(" System fetch | import " + url);
                    code = await LoadEsmModule(url);
                },
            ],
        ];

        await RunMissions(missions);
        if (
            [
                "worker_module",
                "worker_classic",
                "iframe_classic",
                "iframe_module",
            ].includes(env)
        ) {
            code = banner + code;
        }
        code = SystemJSProvider + code;
        return new Response(
            new Blob([createClosure(code)], {
                type: "application/javascript",
            })
        );
    };
};
/*   产生副作用，下载模块，并加入 System 缓存中 */
async function LoadEsmModule(url: string) {
    const System = useGlobal<any>("__Rollup_Web_System__");
    if (!System._esm_module_.has(url)) {
        // import 数据并加入全局缓存
        await import(
            /** @vite-ignore */
            url
        ).then((module) => {
            System._esm_module_.set(url, module);
        });
    }
    return `System.register([],function(exports){
                return {
                    setters: [],
                    execute:function(){
                        const module =  globalThis.__Rollup_Web_System__._esm_module_.get('${url}')
                        Object.entries(module).forEach(([key,value]) => {
                            exports(key,value)
                        });
                    }
                }
            })`;
}
