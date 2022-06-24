import { Compiler, sky_module } from "../../../dist/index.js";
import { wasm } from "../../../dist/plugins/wasm.js";
import { FSFetcher } from "../../../dist/adapter/Fetcher/FSFetcher.js";

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
    // 用于为相对地址添加绝对地址
    // 为没有后缀名的 url 添加后缀名
    extensions: [".js", ".mjs", ".wasm"],
    log(url) {
        console.log("%c Download ==> " + url, "color:green");
    },
    adapter: FSFetcher,
    extraBundle: ["https://fastly.jsdelivr.net/npm/brotli-wasm*/**"],
    ignore: ["http://localhost:8888/package/rollup-web/dist/plugins/**"],
});
compiler.useWorker();
