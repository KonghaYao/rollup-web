// 导入打包产物
import { Compiler, sky_module, PluginLoader } from "../../dist/index.js";
import { babelCore } from "../../dist/plugins/babel.core.js";
import typescript from "https://esm.sh/@babel/preset-typescript@7.18.6";
// 导入各种插件
const [
    { default: json },
    { default: alias },
    { default: commonjs },
    { default: replace },
] = await PluginLoader.loads(
    "plugin-json",
    "plugin-alias",
    "plugin-commonjs",
    "plugin-replace"
);

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
                presets: [typescript],
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
    extensions: [".ts", ".cjs", ".json", ".js"],
    log(url) {
        console.log("%c Download ==> " + url, "color:green");
    },
    cache: {
        // ignore: ["**/dynamic.ts"],
        maxAge: 60,
    },
    // 纳入打包的 url 地址，使用 picomatch 匹配
    // extraBundle: ["https://cdn.skypack.dev/**"],
});
import { Evaluator } from "../../dist/index.js";
const Eval = new Evaluator();
await Eval.createEnv({
    Compiler: compiler,
});
export const module = await Eval.evaluate("./public/test.ts");
