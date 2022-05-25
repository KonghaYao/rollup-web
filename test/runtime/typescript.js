// 导入打包产物
import { Compiler, sky_module } from "../../dist/index.js";
import { initBabel, babel } from "../../dist/plugins/babel.js";

// 导入各种插件
import json from "https://esm.sh/@rollup/plugin-json";
import alias from "https://esm.sh/@rollup/plugin-alias";
import commonjs from "https://esm.sh/@rollup/plugin-commonjs";
import replace from "https://esm.sh/@rollup/plugin-replace";

// swc, babel 需要先进行初始化
// Babel 2-3M 体积明显小于 SWC 17-18M
await initBabel();
// await initSwc();

const config = {
    plugins: [
        json(),
        alias({
            entries: [{ find: "@", replacement: "./" }],
        }),
        commonjs({
            extensions: [".cjs", ".js"],
        }),
        replace({
            __buildDate__: () => JSON.stringify(3434),
            __buildVersion: "15",
        }),
        babel({
            babelrc: {
                presets: [Babel.availablePresets.typescript],
            },
            extensions: [".ts"],
            log(id) {
                console.log("%cBabel typescript > " + id, "color:orange");
            },
        }),
        sky_module({
            cdn: "https://cdn.skypack.dev/",
        }),
    ],
};
const compiler = new Compiler(config, {
    // 用于为相对地址添加绝对地址
    root: window.location.href.replace(/[^\/]*?#.*/, ""),
    // 为没有后缀名的 url 添加后缀名
    extensions: [".ts", ".cjs", ".json"],
    log(url) {
        console.log("%c Download ==> " + url, "color:green");
    },
    // 纳入打包的 url 地址，使用 picomatch 匹配
    bundleArea: [window.location.origin + "/**"],
});
export const module = await compiler.evaluate("./public/test.ts");
