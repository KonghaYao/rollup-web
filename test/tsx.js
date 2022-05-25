// 导入打包产物
import {
    useRollup,
    web_module,
    sky_module,
    ModuleEval,
} from "../dist/index.js";

// 导入各种插件
import { initBabel, babel } from "../dist/plugins/babel.js";
import SolidPresets from "https://esm.sh/babel-preset-solid@1.3.13";
await initBabel();

export const tsxTest = async () => {
    const config = {
        input: "./public/index.tsx",
        output: {
            format: "es",
        },
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
            web_module({
                // root: 'https://cdn.jsdelivr.net/npm/skypack-api/',
                extensions: [".tsx"],
                log(url) {
                    console.log("%c" + url, "color:green");
                },
            }),
            sky_module({
                cdn: "https://cdn.skypack.dev/",
            }),
        ],
    };
    const res = await useRollup(config);
    return res.output[0].code;
};
