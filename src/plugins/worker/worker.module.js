// 这里引用了 CDN 进行加载

import { Evaluator } from "http://localhost:8888/package/rollup-web/dist/index.js";
// import { Evaluator } from "https://fastly.jsdelivr.net/npm/rollup-web@3.7.2/dist/index.js";
import { wrap } from "https://fastly.jsdelivr.net/npm/comlink/dist/esm/comlink.mjs";
const Eval = new Evaluator();

globalThis.addEventListener(
    "message",
    (e) => {
        if (e.data && e.data.password === "__rollup_init__" && e.data.port) {
            Eval.createEnv({
                Compiler: wrap(e.data.port),
                worker: "module",
                root: e.data.localURL,
            }).then(() => {
                // 必须要返回一个值来表示完成了加载
                postMessage("__rollup_ready__");
            });
        }
    },
    { once: true }
);
globalThis.addEventListener("message", (e) => {
    if (e.data && e.data.password === "__rollup_evaluate__" && e.data.url) {
        Eval.evaluate(e.data.url).then((res) => {
            console.warn("module worker receive: ", res);
        });
    }
});
