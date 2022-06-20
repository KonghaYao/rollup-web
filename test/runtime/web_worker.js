import { Evaluator, createWorker } from "../../dist/index.js";

const Eval = new Evaluator();
await Eval.useWorker("./test/runtime/worker/WebWorker-compile.js");
console.log(Eval);
await Eval.createEnv();
console.log("环境布置完成");
export const module = async () =>
    await Eval.evaluate(
        "http://localhost:8888/package/rollup-web/public/worker/worker_module.js"
    );
export const classic = async () =>
    await Eval.evaluate(
        "http://localhost:8888/package/rollup-web/public/worker/worker_classic.js"
    );
