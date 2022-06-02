// 导入打包产物
import { Compiler, loadScript, sky_module } from "../../dist/index.js";
import { mdx } from "../../dist/plugins/mdx.js";
import { babelCore } from "../../dist/plugins/babel.core.js";
import react from "https://esm.sh/@babel/preset-react";

await loadScript(
    "https://fastly.jsdelivr.net/npm/react@18/umd/react.development.min.js"
);
await loadScript(
    "https://fastly.jsdelivr.net/npm/react-dom@18/umd/react-dom.development.min.js"
);

const config = {
    plugins: [
        mdx({
            options: {
                /*  为 true 时不进行 jsx 解析, 同时我们需要配合 babel 插件来解析成 react 的组件 */
                jsx: true,
            },
            log(id, code) {
                console.log(code);
            },
        }),
        babelCore({
            babelrc: {
                presets: [[react, {}]],
            },
            extensions: [".js", ".mdx", ".jsx"],
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
export const module = await compiler.evaluate("./public/mdx/index.jsx");
