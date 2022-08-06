// 导入打包产物
import { Compiler, sky_module } from "../../dist/index.js";

// babelCore 是 babel 插件的核心版本，没有很多的其他插件
import { wasm } from "../../dist/plugins/wasm.js";

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

    extraBundle: ["https://fastly.jsdelivr.net/npm/brotli-wasm@1.2.0/**"],
});
import { Evaluator } from "../../dist/index.js";
const Eval = new Evaluator();
await Eval.createEnv({
    Compiler: compiler,
});
console.log(Eval.moduleConfig.ignore);
export const module = await Eval.evaluate("./public/wasm/wasm.js");
