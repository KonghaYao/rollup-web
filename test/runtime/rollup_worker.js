import { Evaluator } from "../../dist/index.js";
import { wrap } from "https://fastly.jsdelivr.net/npm/comlink/dist/esm/comlink.mjs";
const compiler = wrap(
    new Worker("./test/runtime/worker/compilerWorker.js", {
        type: "module",
    })
);
const Eval = new Evaluator();
console.log(Eval, compiler);
await Eval.createEnv({
    Compiler: compiler,
});
export const module = await Eval.evaluate(
    "http://localhost:8888/package/rollup-web/public/wasm/wasm.js"
);
