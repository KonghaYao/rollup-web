/* 这个是直接被 String 放置在 iframe 中的代码，所以不能使用外部的参数 */
export const threadInit = async () => {
    // import { Evaluator } from "http://localhost:8888/package/rollup-web/dist/index.js";
    /* @ts-ignore */
    const { Evaluator } = await import(
        "https://fastly.jsdelivr.net/npm/rollup-web@3.8.0/dist/index.js"
    );
    /* @ts-ignore */
    const { wrap } = await import("comlink");
    const Eval = new Evaluator();
    (globalThis as any).__Rollup_Env__ = Eval;
    /* 初始化 Compiler 线程的端口, 需要接收到实体的 port，故而需要进行信息接收 */
    const EvalInit = (e: MessageEvent) => {
        if (e.data && e.data.password === "__rollup_init__" && e.data.port) {
            Eval.createEnv({
                Compiler: wrap(e.data.port),
                worker: "module",
                root: e.data.localURL,
            }).then(() => {
                removeEventListener("message", EvalInit);
                dispatchEvent(new Event("__rollup_init__"));
                console.log("iframe 初始化完成");
            });
        }
    };
    addEventListener("message", EvalInit);
    dispatchEvent(new Event("__rollup_ready__"));
    addEventListener("beforeunload", () => {
        Eval.destroy();
    });
};
