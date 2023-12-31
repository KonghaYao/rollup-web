import multiInput from "rollup-plugin-multi-input";
import analyze from "rollup-plugin-analyzer";
import json from "@rollup/plugin-json";
import { writeFileSync } from "fs";
import { emptyDirSync } from "fs-extra";
import { plugins } from "./scripts/plugins.js";
import { paths } from "./scripts/paths.js";

// 清除一下以前的文件，反正 publish 的时候自动删除整个 dist 并重新构建
emptyDirSync("./dist/plugins/");
emptyDirSync("./dist/adapter/");
const pluginInput = "*";
export default {
    //  插件制造，必须要使用这种方式保证 rollup 能够识别 paths
    external: [
        // "picomatch",
        ...Object.keys(paths),
        "https://fastly.jsdelivr.net/npm/@babel/standalone/babel.min.js",
    ],
    input: [
        `src/plugins/${pluginInput}.ts`,
        `src/adapter/Fetcher/${pluginInput}.ts`,
    ],
    output: {
        dir: "dist",
        format: "es",
        paths: {
        },
    },
    plugins: [
        multiInput(),
        json(),
        {
            resolveId(thisFile) {
                if (thisFile === "../utils/wrapPlugin") {
                    return { external: true, id: "../index/index.js" };
                }
            },
        },
        ...plugins,
        analyze({
            summaryOnly: true,
            writeTo: (str) => writeFileSync("dist/plugins.analyze.txt", str),
        }),
    ],
};
