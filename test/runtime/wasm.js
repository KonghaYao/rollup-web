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

    extraBundle: ["https://fastly.jsdelivr.net/npm/**"],
});
export const module = await compiler.evaluate("./public/wasm/wasm.js");
