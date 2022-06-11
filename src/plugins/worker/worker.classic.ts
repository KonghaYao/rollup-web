import { expose, proxy } from "comlink";
import type { Evaluator } from "../../Evaluator";

// 这里引用了 CDN 进行加载
export const ClassicInit = async () => {
    const importScripts = (globalThis as any).importScripts;
    /* @ts-ignore */
    globalThis.module = {};
    await importScripts("https://fastly.jsdelivr.net/npm/process/browser.js");
    await importScripts("https://unpkg.com/comlink/dist/umd/comlink.js");
    //await importScripts("http://localhost:8888/package/rollup-web/dist/Evaluator.umd.js");
    await importScripts(
        "https://fastly.jsdelivr.net/npm/rollup-web@3.7.6/dist/Evaluator.umd.js"
    );
    /* @ts-ignore */
    const { Comlink, Evaluator: EvaluatorModule } = globalThis;
    const { wrap } = Comlink as typeof import("comlink");
    const { Evaluator } = EvaluatorModule as typeof import("../../Evaluator");
    // 删除全局变量以防止冲突
    /* @ts-ignore */
    delete globalThis.Comlink;
    /* @ts-ignore */
    delete globalThis.Evaluator;

    async function fakeImport(url: string) {
        const System = (globalThis as any).System;
        return System.fetch(url)
            .then((res: Response) => {
                return res.text();
            })
            .then((i: string) => {
                // ! 非常危险地将 system 模块转化为异步，并将 importScripts 转化为异步锁定
                const code = i
                    .replace("execute: (function", "execute: (async function")
                    .replace(/^\s*importScripts/gm, "await importScripts");

                return code;
            });
    }
    function SystemInit(localURL: string) {
        const System = (globalThis as any).System;
        /* @ts-ignore */
        globalThis.__importScripts = globalThis.importScripts;
        /* @ts-ignore */
        globalThis.importScripts = (...urls: string[]) => {
            return urls.reduce((col, cur) => {
                return col.then(() => {
                    return System.import(new URL(cur, localURL).toString());
                });
            }, Promise.resolve());
        };
        System.instantiate = function (url: string) {
            var loader = this;
            return Promise.resolve().then(async function () {
                await fakeImport(url);
                return loader.getRegister(url);
            });
        };
    }
    let port: MessagePort;
    addEventListener(
        "message",
        (e) => {
            port = e.data;
            let Eval: Evaluator;
            expose(
                {
                    async init(CompilerPort: MessagePort, localURL: string) {
                        Eval = new Evaluator();
                        await Eval.createEnv({
                            Compiler: wrap(CompilerPort) as any,
                            worker: "module",
                            root: localURL,
                        })
                            .then(() => SystemInit(localURL))
                            .then(() => {
                                this.evaluate(localURL);
                            });
                    },
                    evaluate(url: string) {
                        return proxy(Eval.evaluate(url));
                    },
                },
                port
            );
        },
        { once: true }
    );
};
