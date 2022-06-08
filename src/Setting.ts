import { isInWorker } from "./utils/createWorker";
import { useGlobal } from "./utils/useGlobal";

export const Setting = {
    NPM: (path: string) => "https://fastly.jsdelivr.net/npm/" + path,
    // worker 中有使用了 cdn 中的代码进行操作，故而需要 rollup-web 版本支持
    workerVersion: "3.7.2",
    async loadSystemJS() {
        const systemURL = this.NPM("systemjs@6.12.1/dist/system.min.js");
        if (isInWorker()) {
            await useGlobal<any>("importScripts")(systemURL);
        } else {
            await import(systemURL);
        }
    },
};
