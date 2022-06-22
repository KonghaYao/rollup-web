// 导入打包产物
import { sky_module, PluginLoader, Compiler } from "../../dist/index.js";

// 导入各种插件
// import { babel } from "../../dist/plugins/babel.js";
const { babel } = await PluginLoader.load("babel");

import SolidPresets from "https://esm.sh/babel-preset-solid@1.3.13";

const config = {
    plugins: [
        babel({
            babelrc: {
                presets: [
                    [
                        "typescript",
                        {
                            // 需要使用这种方式兼容 solid 配置
                            isTSX: true,
                            allExtensions: true,
                        },
                    ],
                    SolidPresets,
                ],
            },
            // 注意，默认导入要设置这个为 ""
            extensions: [".tsx", ""],
            log(id) {
                console.log("%c> " + id, "color:green");
            },
        }),
        sky_module({
            cdn: "https://cdn.skypack.dev/",
        }),
    ],
};
const compiler = new Compiler(config, {
    extensions: [".tsx"],
    log(url) {
        console.log("%c" + url, "color:green");
    },
});
import { Evaluator } from "../../dist/index.js";
const Eval = new Evaluator();
await Eval.createEnv({
    Compiler: compiler,
});
export const module = await Eval.evaluate("./public/index.tsx");
