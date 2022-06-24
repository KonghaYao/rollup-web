// 导入打包产物
import {
    Compiler,
    sky_module,
    Evaluator,
    PluginLoader,
} from "../../dist/index.js";

const { wasm } = await PluginLoader.load("wasm", "4.0.0");
// babelCore 是 babel 插件的核心版本，没有很多的其他插件
import { FSFetcher } from "../../dist/adapter/Fetcher/FSFetcher.js";

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

// 初始化 iframe 辅助工具即可
const ifr = new IframeEnv();

export const module = ifr;
