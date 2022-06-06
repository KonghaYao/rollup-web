// 这里引用了 CDN 进行加载
import { Evaluator } from "https://fastly.jsdelivr.net/npm/rollup-web@3.6.0/dist/index.js";
importScripts("https://unpkg.com/comlink/dist/umd/comlink.js");
const Eval = new Evaluator();

globalThis.addEventListener(
    "message",
    (e) => {
        if (e.data && e.data.password === "__rollup_init__" && e.data.port) {
            Eval.createEnv({
                Compiler: Comlink.wrap(e.data.port),
                worker: "module",
            }).then(() => {
                // 必须要返回一个值来表示完成了加载
                postMessage("__rollup_ready__");
                console.log("环境初始化完成", System);
            });
        }
    },
    { once: true }
);
globalThis.addEventListener("message", (e) => {
    if (e.data && e.data.password === "__rollup_evaluate__" && e.data.url) {
        Eval.evaluate(e.data.url).then((res) => {
            console.warn("worker receive: ", res);
        });
    }
});
