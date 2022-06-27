// 导入打包产物
import { Compiler } from "../../dist/index.js";
import { assemblyscript } from "../../dist/plugins/assemblyscript.js";
import { wasm } from "../../dist/plugins/wasm.js";
const config = {
    plugins: [assemblyscript({}), wasm()],
};
const compiler = new Compiler(config, {
    // 用于为相对地址添加绝对地址
    // 为没有后缀名的 url 添加后缀名
    extensions: [".js", ".ts", ".as"],
    log(url) {
        console.log("%c Download ==> " + url, "color:green");
    },
});

import { Evaluator } from "../../dist/index.js";
const Eval = new Evaluator();
await Eval.createEnv({
    Compiler: compiler,
});
console.log(System.extendsImportMap);
globalThis.System.extendsImportMap({
    imports: {
        path: "https://esm.sh/path",
        chai: "https://fastly.jsdelivr.net/npm/chai/+esm",

        binaryen:
            "https://fastly.jsdelivr.net/npm/binaryen@108.0.0-nightly.20220528/index.js",
        long: "https://fastly.jsdelivr.net/npm/long@5.2.0/index.js",
        assemblyscript:
            "https://fastly.jsdelivr.net/npm/assemblyscript@0.20.8/dist/assemblyscript.js",
        "assemblyscript/asc":
            "https://fastly.jsdelivr.net/npm/assemblyscript@0.20.8/dist/asc.js",
    },
});
export const module = await Eval.evaluate("./public/assembly/index.js");
