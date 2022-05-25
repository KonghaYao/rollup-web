// 导入打包产物
import {
    useRollup,
    web_module,
    DynamicServer,
    sky_module,
} from "../dist/index.js";

import { initBabel, babel } from "../dist/plugins/babel.js";
import json from "https://esm.sh/@rollup/plugin-json";
await initBabel();
const server = new DynamicServer("_import");
export const DynamicImport = async () => {
    const config = {
        // 如果使用 obj_module,需要使用绝对路径
        input: "./public/dynamic",
        output: {
            format: "es",
        },
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
            web_module({
                extensions: [".ts", ".cjs", ".json"],
                log(url) {
                    console.log("%c网络文件 " + url, "color:green");
                },
            }),
            sky_module(),
            // 这是一种异步导入方案，使用 全局的一个外置 Server 来保证代码的正确执行
            server.createPlugin({}),
        ],
    };
    /** 需要在使用前注册一下这个server */
    server.registerRollupPlugins(config.plugins);
    const res = await useRollup(config);
    return res.output[0].code;
};
