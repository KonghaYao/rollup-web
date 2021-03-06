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
// 挂载 config
var __config = (()=>{
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
self = new Proxy(globalThis.self, __config);
globalThis = new Proxy(globalThis, __config); 
// This is Source Code
`;
};
