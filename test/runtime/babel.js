// 导入打包产物
import { Compiler, sky_module } from "../../dist/index.js";

// babelCore 是 babel 插件的核心版本，没有很多的其他插件
import { babelCore } from "../../dist/plugins/babel.core.js";

// 导入各种插件
import json from "https://esm.sh/@rollup/plugin-json";
import alias from "https://esm.sh/@rollup/plugin-alias";
import commonjs from "https://esm.sh/@rollup/plugin-commonjs";
import replace from "https://esm.sh/@rollup/plugin-replace";
import ts from "https://esm.sh/@babel/preset-typescript";

const config = {
    plugins: [
        json(),
        alias({
            entries: [{ find: "@", replacement: "." }],
        }),
        commonjs({
            extensions: [".cjs", ".js"],
        }),
        replace({
            __buildDate__: () => JSON.stringify(3434),
            __buildVersion: "15",
        }),
        babelCore({
            babelrc: {
                presets: [ts],
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
    // 为没有后缀名的 url 添加后缀名
    extensions: [".ts", ".cjs", ".json"],
    log(url) {
        console.log("%c Download ==> " + url, "color:green");
    },
    useDataCache: {
        // ignore: ["**/dynamic.ts"],
        maxAge: 60,
    },
    // 纳入打包的 url 地址，使用 picomatch 匹配
    extraBundle: ["https://cdn.skypack.dev/**"],
});
import { Evaluator } from "../../dist/index.js";
const Eval = new Evaluator();
await Eval.createEnv({
    Compiler: compiler,
});
export const module = await Eval.evaluate("./public/test.ts");
