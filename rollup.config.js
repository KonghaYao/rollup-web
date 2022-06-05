import multiInput from "rollup-plugin-multi-input";
import analyze from "rollup-plugin-analyzer";
import json from "@rollup/plugin-json";
import { writeFileSync } from "fs";
import { emptyDir } from "./scripts/emptyDir.js";
import { plugins } from "./scripts/plugins.js";
import { paths } from "./scripts/paths.js";

true && emptyDir("./dist");
const pluginInput = "*";
export default [
    {
        external: ["rollup-web", "process-bundle", "picomatch", "comlink"],
        input: "./src/index.ts",
        output: {
            file: "./dist/index.js",
            format: "es",
            paths: {
                ...paths,
            },
        },
        plugins: [
            ...plugins,

            analyze({
                summaryOnly: true,
                writeTo: (str) => writeFileSync("dist/index.analyze.txt", str),
            }),
        ],
    },
    {
        // 必须要使用这种方式保证 rollup 能够识别 paths
        external: [
            ...Object.keys(paths),
            "https://fastly.jsdelivr.net/npm/@babel/standalone/babel.min.js",
        ],
        input: [`src/plugins/${pluginInput}.ts`],
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

            ...plugins,
            analyze({
                summaryOnly: true,
                writeTo: (str) =>
                    writeFileSync("dist/plugins.analyze.txt", str),
            }),
        ],
    },
];
