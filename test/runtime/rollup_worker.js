import { Evaluator, createWorker } from "../../dist/index.js";

const Eval = new Evaluator();
await Eval.useWorker("./test/runtime/worker/compilerWorker.js");
console.log(Eval);

// 如果是 useWorker 的方式的话，可以不输入 Compiler
await Eval.createEnv();
console.log("环境布置完成");
export const module = await Eval.evaluate(
    "http://localhost:8888/package/rollup-web/public/wasm/wasm.js"
);
console.log(Eval);
