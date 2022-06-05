import { Evaluator, createWorker } from "../../dist/index.js";
import { wrap } from "https://fastly.jsdelivr.net/npm/comlink/dist/esm/comlink.mjs";

// 需要使用这种方式等候 线程结束初始化
const worker = await createWorker("./test/runtime/worker/compilerWorker.js", {
    type: "module",
});
const compiler = wrap(worker);

const Eval = new Evaluator();
console.log(Eval, compiler);
await Eval.createEnv({
    Compiler: compiler,
});
console.log("环境布置完成");
export const module = await Eval.evaluate(
    "http://localhost:8888/package/rollup-web/public/wasm/wasm.js"
);
