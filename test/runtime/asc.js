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
export const module = await Eval.evaluate("./public/assembly/index.js");
