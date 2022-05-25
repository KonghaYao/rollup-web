// 导入打包产物
import { useRollup, web_module, sky_module } from "../dist/index.js";

// 导入各种插件
import json from "https://esm.sh/@rollup/plugin-json";
import { initBabel, babel } from "../dist/plugins/babel.js";
// import { initSwc, swcPlugin } from "../dist/plugins/swc.js";
import alias from "https://esm.sh/@rollup/plugin-alias";
import commonjs from "https://esm.sh/@rollup/plugin-commonjs";
import replace from "https://esm.sh/@rollup/plugin-replace";
import visualizer from "../dist/plugins/visualizer.js";
// swc, babel 需要先进行初始化
// Babel 2-3M 体积明显小于 SWC 17-18M
await initBabel();
export const Visualizer = async () => {
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
                extensions: [".ts", ""],
                log(id) {
                    console.log("%cBabel typescript > " + id, "color:orange");
                },
            }),
            web_module({
                extensions: [".ts", ".cjs", ".json"],
                log(url) {
                    console.log("%c网络文件 " + url, "color:green");
                },
            }),
            sky_module({
                cdn: "https://cdn.skypack.dev/",
            }),
            visualizer({
                gzipSize: false,
                json: false,
                template: "treemap",
                brotliSize: false,
            }),
        ],
    };
    globalThis.fs._events.on("writeFile", (filename, fileContent) => {
        // 需要使用 fs 进行兼容
        const url = URL.createObjectURL(
            new File([fileContent], filename, { type: "text/html" })
        );
        console.log({ filename, fileContent });
        const iframe = document.createElement("iframe");
        iframe.src = url;
        document.body.appendChild(iframe);
    });
    globalThis.fs._readFile.filters.push(async (path, options) => {
        const paths = ["network", "sunburst", "treemap"].flatMap((i) => [
            `../lib/${i}.js`,
            `../lib/${i}.css`,
        ]);
        if (paths.includes(path))
            return fetch(
                path.replace(
                    "../",
                    "https://fastly.jsdelivr.net/npm/rollup-plugin-visualizer/dist/"
                )
            ).then((res) => res.text());
        console.log(path);
    });
    const res = await useRollup(config);

    console.log(res.output);
    return res.output[0].code;
};
