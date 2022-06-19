import { useGlobal } from "./utils/useGlobal";

export const Setting = {
    NPM: (path: string) => "https://fastly.jsdelivr.net/npm/" + path,
    // worker 中有使用了 cdn 中的代码进行操作，故而需要 rollup-web 版本支持
    workerVersion: "3.9.0",
    async loadSystemJS() {
        const systemURL = this.NPM("systemjs@6.12.1/dist/system.min.js");

        // TODO 本来是要划分 classic worker 和 module 的，但是暂时没有想到方法
        try {
            await import(systemURL);
        } catch (e) {
            await useGlobal<any>("importScripts")(systemURL);
        }
    },
};
