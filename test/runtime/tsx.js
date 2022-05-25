// 导入打包产物
import { sky_module } from "../../dist/index.js";

// 导入各种插件
import { initBabel, babel } from "../../dist/plugins/babel.js";
import SolidPresets from "https://esm.sh/babel-preset-solid@1.3.13";
import { Compiler } from "../../dist/index.js";
await initBabel();

const config = {
    plugins: [
        babel({
            babelrc: {
                presets: [
                    [
                        Babel.availablePresets["typescript"],
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
export const module = await compiler.evaluate("./public/index.tsx");
