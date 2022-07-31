import { Evaluator } from "../../dist/index.js";
import { Compiler, sky_module } from "../../dist/index.js";
import { worker } from "../../dist/plugins/worker.js";
import { wasm } from "../../dist/plugins/wasm.js";
const config = {
    plugins: [
        wasm({
            mode: "node",
        }),
        worker(),
        sky_module({
            cdn: "https://fastly.jsdelivr.net/npm/",
        }),
    ],
};
const compiler = new Compiler(config, {
    root: "http://localhost:8888/package/rollup-web/",
    extensions: [".js", ".mjs", ".wasm"],
    log(url) {
        console.log("%c Download ==> " + url, "color:green");
    },
    extraBundle: ["https://fastly.jsdelivr.net/npm/brotli-wasm*/**"],
});

const Eval = new Evaluator();
console.log(Eval, compiler);
await Eval.createEnv({
    Compiler: compiler,
});
console.log("环境布置完成");
export const localBuild = async () =>
    await Eval.evaluate(
        "http://localhost:8888/package/rollup-web/public/worker/worker_module.js"
    );
