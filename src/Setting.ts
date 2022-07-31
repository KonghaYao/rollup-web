import { setGlobal, useGlobal } from "./utils/useGlobal";
// import type { SystemJS } from "system-ts";
export const Setting = {
    NPM: (path: string) => "https://fastly.jsdelivr.net/npm/" + path,
    // worker 中有使用了 cdn 中的代码进行操作，故而需要 rollup-web 版本支持
    // iframe 中也需要
    // 发布版本时会进行一个替换
    version: __Version,
    SystemVersion: "6.12.1-1",
    async loadSystemJS(baseURL: string) {
        // TODO 注意类型替换
        let System: any;
        try {
            const { SystemJS } = await import(
                this.NPM(`system-ts@${this.SystemVersion}/dist/s.min.js`)
            );
            System = new SystemJS();
            setGlobal("__Rollup_Web_System__", System);
        } catch (e) {
            // 在 worker 中
            await useGlobal<any>("importScripts")(
                this.NPM(`system-ts@${this.SystemVersion}/dist/umd/s.min.js`)
            );
            /* @ts-ignore */
            System = new globalThis.SystemJS.SystemJS();
            setGlobal("__Rollup_Web_System__", System);
        }
        System.setBaseUrl(baseURL);
        return System;
    },
};
