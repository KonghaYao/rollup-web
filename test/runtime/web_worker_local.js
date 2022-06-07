import { Evaluator, createWorker } from "../../dist/index.js";
import { expose } from "https://fastly.jsdelivr.net/npm/comlink/dist/esm/comlink.mjs";
import { Compiler, sky_module } from "../../../dist/index.js";
import { worker } from "../../../dist/plugins/worker.js";
import { wasm } from "../../../dist/plugins/wasm.js";
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
    // 注意，在 worker 中 root 会被识别为文件所在的地址, 而不是 html 的地址
    root: "http://localhost:8888/package/rollup-web/",
    autoBuildFetchHook: false,

    // 用于为相对地址添加绝对地址
    // 为没有后缀名的 url 添加后缀名
    extensions: [".js", ".mjs", ".wasm"],
    log(url) {
        console.log("%c Download ==> " + url, "color:green");
    },
    // useDataCache: {
    //     // ignore: ["**/dynamic.ts"],
    //     maxAge: 60,
    // },
    extraBundle: ["https://fastly.jsdelivr.net/npm/brotli-wasm*/**"],
});

const channel = new MessageChannel();

const Eval = new Evaluator();
console.log(Eval, compiler);
await Eval.createEnv({
    Compiler: compiler,
});
console.log("环境布置完成");
// export const module = await Eval.evaluate(
//     "http://localhost:8888/package/rollup-web/public/worker/worker_module.js"
// );
export const classic = await Eval.evaluate(
    "http://localhost:8888/package/rollup-web/public/worker/worker_classic.js"
);
