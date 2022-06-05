import * as Comlink from "https://fastly.jsdelivr.net/npm/comlink/dist/esm/comlink.mjs";
import { Compiler, PluginLoader, sky_module } from "../../../dist/index.js";

// ! 线程中如果使用异步操作，会导致 comlink 无法及时构建联系，导致主线程的 comlink 请求持续无反应
// 所以可以采用线程主动返回 init 的方式来进行初始化完成识别
const { wasm } = await PluginLoader.load("wasm", "3.5.0");
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

// 通知线程初始化结束
postMessage("ready");
