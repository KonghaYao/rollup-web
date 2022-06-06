// 这里引用了 CDN 进行加载
import { Evaluator } from "https://fastly.jsdelivr.net/npm/rollup-web/dist/index.js";
import { wrap } from "https://fastly.jsdelivr.net/npm/comlink/dist/esm/comlink.mjs";
const Eval = new Evaluator();
let __ready__ = false;
globalThis.addEventListener(
    "message",
    (e) => {
        if (e.data && e.data.password === "__rollup_init__" && e.data.port) {
            Eval.createEnv({
                Compiler: wrap(e.data.port),
                worker: "module",
            }).then(() => {
                // 必须要返回一个值来表示完成了加载
                postMessage("__rollup_ready__");
                __ready__ = true;
                console.log("环境初始化完成", System);
            });
        }
    },
    { once: true }
);
globalThis.addEventListener("message", (e) => {
    if (
        e.data &&
        e.data.password === "__rollup_evaluate__" &&
        e.data.url &&
        __ready__
    ) {
        Eval.evaluate(e.data.url).then((res) => {
            console.warn("worker receive: ", res);
        });
    }
});
