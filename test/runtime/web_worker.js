import { Evaluator, createWorker } from "../../dist/index.js";
import {
    wrap,
    createEndpoint,
} from "https://fastly.jsdelivr.net/npm/comlink/dist/esm/comlink.mjs";

// 需要使用这种方式等候 线程结束初始化
const worker = await createWorker(
    "./test/runtime/worker/WebWorker-compile.js",
    {
        type: "module",
    }
);
const compiler = wrap(worker);

const Eval = new Evaluator();
console.log(Eval, compiler);
await Eval.createEnv({
    Compiler: compiler,
});
console.log("环境布置完成");
export const module = async () =>
    await Eval.evaluate(
        "http://localhost:8888/package/rollup-web/public/worker/worker_module.js"
    );
export const classic = async () =>
    await Eval.evaluate(
        "http://localhost:8888/package/rollup-web/public/worker/worker_classic.js"
    );
