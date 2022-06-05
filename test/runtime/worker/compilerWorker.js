import * as Comlink from "https://fastly.jsdelivr.net/npm/comlink/dist/esm/comlink.mjs";
import { Compiler, PluginLoader, sky_module } from "../../../dist/index.js";
// import { wasm } from "../../../dist/plugins/wasm.js";

// ! 线程中如果使用异步操作，会导致 comlink 无法及时构建联系，导致主线程的 comlink 请求持续无反应
const { wasm } = await PluginLoader.load("wasm");
const config = {
    plugins: [
        wasm({
            mode: "node",
        }),
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

    extraBundle: ["https://fastly.jsdelivr.net/npm/brotli-wasm*/**"],
});
Comlink.expose(compiler);
postMessage("init");
