import { Evaluator } from "https://fastly.jsdelivr.net/npm/rollup-web/dist/index.js";
import { wrap } from "https://fastly.jsdelivr.net/npm/comlink/dist/esm/comlink.mjs";
const Eval = new Evaluator();
globalThis.importScripts = (...url) => {
    console.warn(url);
};
globalThis.addEventListener(
    "message",
    (e) => {
        if (e.data && e.data.password === "__rollup_init__" && e.data.port) {
            Eval.createEnv({
                Compiler: wrap(e.data.port),
            }).then(() => {
                console.log("Worker 环境布置完成");
                postMessage("init");
            });
        }
    },
    { once: true }
);
globalThis.addEventListener("message", (e) => {
    if (e.data && e.data.password === "__rollup_evaluate__" && e.data.url) {
        Eval.evaluate(e.data.url);
    }
});
