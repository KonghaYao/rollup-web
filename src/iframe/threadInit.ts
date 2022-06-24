/* 这个是直接被 String 放置在 iframe 中的代码，所以不能使用外部的参数 */
export const threadInit = async () => {
    // const { Evaluator } = await import(
    //     "http://localhost:8888/package/rollup-web/dist/index.js"
    // );
    /* @ts-ignore */
    const { Evaluator } = await import(
        "https://fastly.jsdelivr.net/npm/rollup-web@4.1.1/dist/index.js"
    );
    const Eval = new Evaluator();
    (globalThis as any).__Rollup_Env__ = Eval;
    /* 初始化 Compiler 线程的端口, 需要接收到实体的 port，故而需要进行信息接收 */
    const EvalInit = async (e: MessageEvent) => {
        if (e.data && e.data.password === "__rollup_init__" && e.data.port) {
            await Eval.useWorker(e.data.port);
            await Eval.createEnv({
                worker: "module",
                env: "iframe",
                root: e.data.localURL,
            });
            removeEventListener("message", EvalInit);
            dispatchEvent(new Event("__rollup_init__"));
            console.log("iframe 初始化完成");
        }
    };
    addEventListener("message", EvalInit);
    dispatchEvent(new Event("__rollup_ready__"));
    addEventListener("beforeunload", () => {
        Eval.destroy();
    });
};
