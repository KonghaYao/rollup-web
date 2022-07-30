import { ModuleConfig } from "../adapter/web_module";
import { EnvTag } from "../Evaluator";
import { createLocationCode } from "./envi/createLocationCode";

/* 内置插件，用于将 iframe, worker 中的环境参数统一 */
export const environment = (
    { config }: { config: ModuleConfig },
    env: EnvTag
) => {
    let locationCode = createLocationCode(env, config);
    return `

// 这里声明了 location 变量
${locationCode}

// 挂载 config, var 声明才能使用
let __config = (()=>{
    const replacer = {
        location,
    };
    return {
        get(target, p, receiver) {
            if (p in replacer) return replacer[p];
            return target[p];
        },
    }
})();

// 重复声明它们，保证其可用
self = new Proxy(globalThis.self, __config);
globalThis = new Proxy(globalThis, __config); 

// This is Source Code
`;
};
export const SystemJSProvider = `

// 使用 var 可以保证全局是加载，但是在 Classic 中覆盖了全局的变量
let System = globalThis.__Rollup_Web_System__
`;
