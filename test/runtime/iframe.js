import { Evaluator, IframeEnv } from "../../dist/index.js";

const Eval = new Evaluator();
await Eval.useWorker("./test/runtime/worker/compilerWorker.js");
const port = await Eval.createCompilerPort();

// 初始化 iframe 辅助工具即可
const ifr = new IframeEnv();
await ifr.mount({
    src: "http://localhost:8888/package/rollup-web/public/iframe/index.html",
    port,
});
export const module = null;
