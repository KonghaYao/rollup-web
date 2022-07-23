import { useGlobal } from "./utils/useGlobal";

export const Setting = {
    NPM: (path: string) => "https://fastly.jsdelivr.net/npm/" + path,
    // worker 中有使用了 cdn 中的代码进行操作，故而需要 rollup-web 版本支持
    // iframe 中也需要
    // 发布版本时会进行一个替换
    version: __Version,
    async loadSystemJS() {
        const systemURL = this.NPM("systemjs@6.12.1/dist/system.min.js");

        try {
            await import(systemURL);
        } catch (e) {
            // 在 worker 中
            await useGlobal<any>("importScripts")(systemURL);
        }
    },
};
