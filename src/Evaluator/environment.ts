import { ModuleConfig } from "src/adapter/web_module";
const locationCover = (url: string) => {
    const info = new URL(url);
    const data = [
        "hash",
        "host",
        "hostname",
        "href",
        "origin",
        "pathname",
        "port",
        "protocol",
        "search",
    ].reduce((col, cur) => {
        col[cur] = (info as any)[cur];
        return col;
    }, {} as any);
    const result = Object.assign(data, {
        assign() {},
        ancestorOrigins: { length: 0 },
        reload() {},
        replace() {},
        toString() {},
    });

    return result;
};

/* 内置插件，用于将 iframe, worker 中的环境参数统一 */
export const environment = ({ config }: { config: ModuleConfig }) => {
    return `
var location = (${locationCover.toString()})("${config.root as string}");
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
globalThis = new Proxy(globalThis, __config); `;
};
