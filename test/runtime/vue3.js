// 导入打包产物
import { Compiler, sky_module } from "../../dist/index.js";
import { vue } from "../../dist/plugins/vue3.js";
import { babel } from "../../dist/plugins/babel.js";

import { css } from "../../dist/plugins/css.js";
// 导入各种插件
import json from "https://esm.sh/@rollup/plugin-json";
import alias from "https://esm.sh/@rollup/plugin-alias";
import commonjs from "https://esm.sh/@rollup/plugin-commonjs";
import replace from "https://esm.sh/@rollup/plugin-replace";

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
                presets: [
                    [
                        "typescript",
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

        vue({
            css: {},
            cssLang: "less",
        }),
        css(),
        sky_module({
            cdn: (name) => `https://fastly.jsdelivr.net/npm/${name}/+esm`,
            rename: {
                pinia: "pinia@2.0.11/dist/pinia.esm-browser.js/+esm",
                "vue-router":
                    "vue-router@4.0.12/dist/vue-router.esm-browser.js",
                "@vue/devtools-api": "@vue/devtools-api/+esm",
                vue: "vue@3.2.25/dist/vue.runtime.esm-browser.js",
            },
        }),
    ],
};

const compiler = new Compiler(config, {
    extensions: [".vue", ".ts", ".cjs", ".json"],
    log(url) {
        console.log("%cDownload " + url, "color:green");
    },
    // 纳入打包的 url 地址，使用 picomatch 匹配
    bundleArea: [window.location.origin + "/**"],
});
export const module = await compiler.evaluate("./public/vue-main.ts");
