import { Evaluator } from "https://fastly.jsdelivr.net/npm/rollup-web@3.7.6/dist/index.js";
import { wrap } from "https://fastly.jsdelivr.net/npm/comlink/dist/esm/comlink.mjs";
const Eval = new Evaluator();
const EvalCode = (url) =>
    Eval.evaluate(url).then((res) => {
        console.warn("module worker receive: ", res);
    });
Eval.createCompilerPort().then((port) => {
    const api = wrap(port);
});
globalThis.addEventListener("message", (e) => {
    if (e.data && e.data.password === "__rollup_evaluate__" && e.data.url) {
        EvalCode(e.data.url);
    }
});
globalThis.addEventListener(
    "message",
    (e) => {
        if (e.data && e.data.password === "__rollup_init__" && e.data.port) {
            Eval.createEnv({
                Compiler: wrap(e.data.port),
                worker: "module",
                root: e.data.localURL,
            }).then(() => {
                EvalCode(e.data.localURL);
            });
        }
    },
    { once: true }
);
