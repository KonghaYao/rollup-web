// 导入打包产物
import { useRollup, web_module, sky_module } from "../dist/index.js";

// 导入各种插件
import json from "https://esm.sh/@rollup/plugin-json";
import { initBabel, babel } from "../dist/plugins/babel.js";
// import { initSwc, swcPlugin } from "../dist/plugins/swc.js";
import alias from "https://esm.sh/@rollup/plugin-alias";
import commonjs from "https://esm.sh/@rollup/plugin-commonjs";
import replace from "https://esm.sh/@rollup/plugin-replace";

// swc, babel 需要先进行初始化
// Babel 2-3M 体积明显小于 SWC 17-18M
await initBabel();
// await initSwc();
export const tsTest = async () => {
    const config = {
        input: "./public/test.ts",
        output: {
            format: "es",
        },
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
            web_module({
                extensions: [".ts", ".cjs", ".json"],
                log(url) {
                    console.log("%cDownload " + url, "color:green");
                },
            }),
            sky_module({
                cdn: "https://cdn.skypack.dev/",
            }),
            // {
            //     load(id) {
            //         console.error({ id });
            //         return fetch(id).then((res) => res.text());
            //     },
            // },
        ],
    };
    const res = await useRollup(config);
    return res.output[0].code;
};
