// 导入打包产物
import { Compiler, loadScript, sky_module } from "../../dist/index.js";
import { mdx } from "../../dist/plugins/mdx.js";
import { babelCore } from "../../dist/plugins/babel.core.js";
import react from "https://esm.sh/@babel/preset-react";

// react version
// await loadScript(
//     "https://fastly.jsdelivr.net/npm/react@18/umd/react.development.min.js"
// );
// await loadScript(
//     "https://fastly.jsdelivr.net/npm/react-dom@18/umd/react-dom.development.min.js"
// );
import SolidPresets from "https://esm.sh/babel-preset-solid@1.3.13";

const config = {
    plugins: [
        mdx({
            options: {
                /*  为 true 时不进行 jsx 解析, 同时我们需要配合 babel 插件来解析成 react 的组件 */
                // jsx: true, // react version
                jsxImportSource: "solid-jsx",
            },
            log(id, code) {
                console.log(code);
            },
        }),
        babelCore({
            babelrc: {
                presets: [
                    // react, // react version
                    SolidPresets,
                ],
            },
            extensions: [".js", ".mdx", ".jsx"],
            log(id, code) {
                console.log(code, id);
            },
        }),
        sky_module({
            cdn: "https://cdn.skypack.dev/",
        }),
    ],
};
const compiler = new Compiler(config, {
    // 用于为相对地址添加绝对地址
    // 为没有后缀名的 url 添加后缀名
    extensions: [".mdx", ".jsx", ".js"],
    log(url) {
        console.log("%c Download ==> " + url, "color:green");
    },
});
import { Evaluator } from "../../dist/index.js";
const Eval = new Evaluator();
await Eval.createEnv({
    Compiler: compiler,
});
export const module = await Eval.evaluate("./public/mdx/index.jsx");
