import {
    Compiler,
    sky_module,
    Evaluator,
    PluginLoader,
} from "../../dist/index.js";
import { FSFetcher } from "../../dist/adapter/Fetcher/FSFetcher.js";

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
    // 用于为相对地址添加绝对地址
    // 为没有后缀名的 url 添加后缀名
    extensions: [".js", ".mjs", ".wasm"],
    log(url) {
        console.log("%c Download ==> " + url, "color:green");
    },
    adapter: FSFetcher,
    extraBundle: ["https://fastly.jsdelivr.net/npm/brotli-wasm*/**"],
});

import { IframeEnv } from "../../dist/Iframe.js";
const Eval = new Evaluator();
await Eval.createEnv({
    Compiler: compiler,
});

export const port = await Eval.createCompilerPort();

export const module = new IframeEnv();
