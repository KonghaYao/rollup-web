import { createWorker } from "../../dist/index.js";
import { IframeEnv } from "../../dist/Iframe.js";
import {
    wrap,
    createEndpoint,
} from "https://fastly.jsdelivr.net/npm/comlink/dist/esm/comlink.mjs";

// 需要使用这种方式等候 线程结束初始化
const worker = await createWorker("./test/runtime/worker/compilerWorker.js", {
    type: "module",
});
const compiler = wrap(worker);
const port = await compiler[createEndpoint]();

// 初始化 iframe 辅助工具即可
const ifr = new IframeEnv();
await ifr.mount({
    src: "http://localhost:8888/package/rollup-web/public/iframe/index.html",
    port,
});
export const module = null;
