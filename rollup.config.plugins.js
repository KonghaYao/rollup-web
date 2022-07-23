import multiInput from "rollup-plugin-multi-input";
import analyze from "rollup-plugin-analyzer";
import json from "@rollup/plugin-json";
import { writeFileSync } from "fs";
import { emptyDirSync } from "fs-extra";
import { plugins } from "./scripts/plugins.js";
import { paths } from "./scripts/paths.js";

true && emptyDirSync("./dist/plugins/");
const pluginInput = "*";
export default {
    //  插件制造，必须要使用这种方式保证 rollup 能够识别 paths
    external: [
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
            ...paths,
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
