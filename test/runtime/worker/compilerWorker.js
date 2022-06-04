import * as Comlink from "https://fastly.jsdelivr.net/npm/comlink/dist/esm/comlink.mjs";
import { Compiler, sky_module } from "../../../dist/index.js";
import { wasm } from "../../../dist/plugins/wasm.js";

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
