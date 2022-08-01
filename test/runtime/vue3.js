// 导入打包产物
import { Compiler, sky_module } from "../../dist/index.js";
import { vue3 } from "../../dist/plugins/vue3.js";
import { babelCore } from "../../dist/plugins/babel.core.js";

import { less } from "../../dist/plugins/less.js";
import { sass } from "../../dist/plugins/sass.js";
import { postcss } from "../../dist/plugins/postcss.js";
import { assets } from "../../dist/plugins/assets.js";
// 导入各种插件
import json from "https://esm.sh/@rollup/plugin-json";
import alias from "https://esm.sh/@rollup/plugin-alias";
import commonjs from "https://esm.sh/@rollup/plugin-commonjs";
import replace from "https://esm.sh/@rollup/plugin-replace";
import typescript from "https://esm.sh/@babel/preset-typescript";

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

        sass({
            log(id, code) {
                console.log("sass ", id);
            },
        }),
        less({
            log(id, code) {
                console.log("less ", id);
            },
        }),
        babelCore({
            babelrc: {
                presets: [
                    [
                        typescript,
                        {
                            // 需要使用这种方式兼容 solid 配置
                            isTSX: true,
                            allExtensions: true,
                        },
                    ],
                ],
            },
            extensions: [".ts"],
            log(id) {
                console.log("%cBabel typescript > " + id, "color:orange");
            },
        }),

        vue3({
            log(id, code) {
                console.log(id, code);
            },
        }),
        assets(),
        postcss({
            log(id, code) {
                console.log("postcss ", id);
            },
            extensions: [".css", ".less", ".scss"],
        }),
        sky_module({
            cdn: (name) => `https://fastly.jsdelivr.net/npm/${name}/+esm`,
        }),
    ],
    external: ["vue", "vue-router", "pinia", "@vue/devtools-api"],
};

const compiler = new Compiler(config, {
    extensions: [".vue", ".ts", ".cjs", ".json", ".css", ".less", ".sass"],
    log(url) {
        console.log("%cDownload " + url, "color:green");
    },
});
import { Evaluator } from "../../dist/index.js";
const Eval = new Evaluator();
await Eval.createEnv({
    Compiler: compiler,
});
Eval.System.extendImportMap(
    {
        imports: {
            pinia: "https://fastly.jsdelivr.net/npm/pinia@2.0.11/dist/pinia.esm-browser.js/+esm",
            "vue-router":
                "https://fastly.jsdelivr.net/npm/vue-router@4.0.12/dist/vue-router.esm-browser.js",
            "@vue/devtools-api":
                "https://fastly.jsdelivr.net/npm/@vue/devtools-api/+esm",
            vue: "https://fastly.jsdelivr.net/npm/vue@3.2.25/dist/vue.runtime.esm-browser.js",
        },
    },
    location.href
);
console.log(Eval.System);
export const module = await Eval.evaluate("./public/vue-main.ts");
