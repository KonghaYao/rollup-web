// 导入打包产物
import { Compiler, sky_module } from "../../dist/index.js";
import { mdx } from "../../dist/plugins/mdx.js";
import { babelCore } from "../../dist/plugins/babel.core.js";
import react from "https://esm.sh/@babel/preset-react";
const config = {
    plugins: [
        mdx(),
        babelCore({
            babelrc: {
                presets: [[react, {}]],
            },
            extensions: [".js"],
        }),
        sky_module({
            cdn: "https://cdn.skypack.dev/",
        }),
    ],
};
const compiler = new Compiler(config, {
    // 用于为相对地址添加绝对地址
    // 为没有后缀名的 url 添加后缀名
    extensions: [".mdx", ".ts", ".js"],
    log(url) {
        console.log("%c Download ==> " + url, "color:green");
    },
});
export const module = await compiler.evaluate("./public/mdx/index.mdx");
