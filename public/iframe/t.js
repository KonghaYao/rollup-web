(async () => {
    // import { Evaluator } from "http://localhost:8888/package/rollup-web/dist/index.js";

    /* @ts-ignore */
    const { Evaluator } = await import(
        "https://fastly.jsdelivr.net/npm/rollup-web@3.7.6/dist/index.js"
    );
    /* @ts-ignore */

    const { wrap } = await import(
        "https://fastly.jsdelivr.net/npm/comlink/dist/esm/comlink.mjs"
    );
    const Eval = new Evaluator();

    const EvalCode = (url) => Eval.evaluate(url);

    addEventListener("message", (e) => {
        if (e.data && e.data.password === "__rollup_evaluate__" && e.data.url) {
            EvalCode(e.data.url);
        }
    }); // 初始化 Compiler 线程的端口

    const EvalInit = (e) => {
        if (e.data && e.data.password === "__rollup_init__" && e.data.port) {
            Eval.createEnv({
                Compiler: wrap(e.data.port),
                worker: "module",
                root: e.data.localURL,
            });
            removeEventListener("message", EvalInit);
            dispatchEvent(new Event("__rollup_init__"));
            console.log("iframe 初始化完成");
        }
    };

    addEventListener("message", EvalInit);
})();
