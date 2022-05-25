// 导入打包产物
import { Compiler, sky_module } from "../dist/index.js";

import { initBabel, babel } from "../dist/plugins/babel.js";
import json from "https://esm.sh/@rollup/plugin-json";
await initBabel();
export const CompilerDynamicImport = async () => {
    const config = {
        plugins: [
            json(),
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
                cdn: "https://cdn.skypack.dev",
            }),
        ],
    };
    const compiler = new Compiler(config, {
        root: window.location.origin + "/package/rollup-web/",
        extensions: [".ts", ".cjs", ".json"],
        log(url) {
            console.log("%c网络文件 " + url, "color:green");
        },
    });
    await compiler.compile("./public/dynamic.ts");

    return compiler.evaluate("./public/dynamic.ts");
};
