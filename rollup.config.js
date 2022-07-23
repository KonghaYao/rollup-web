import analyze from "rollup-plugin-analyzer";
import { outputFileSync } from "fs-extra";
import { emptyDirSync } from "fs-extra";
import { plugins } from "./scripts/plugins.js";
import { paths } from "./scripts/paths.js";

emptyDirSync("./dist/index");
const external = [
    "rollup-web",
    "process-bundle",
    "picomatch",
    "comlink",
    "@isomorphic-git/lightning-fs",
    "rehype",
    "unist-util-visit",
    "@konghayao/iframe-box",
];

// * 输出这个文件是为了与之前的 API 共存
outputFileSync("./dist/index.js", `export * from './index/index.js';`);
export default [
    {
        // ! IframeEnv 太小了，所以直接打包进去
        external,
        input: "./src/index.ts",
        output: {
            dir: "./dist/index/",
            format: "es",
            paths: {
                ...paths,
            },
        },
        plugins: [
            ...plugins,

            analyze({
                summaryOnly: true,
                writeTo: (str) => outputFileSync("dist/index.analyze.txt", str),
            }),
        ],
    },
    {
        // 这是给 worker 使用的 umd 版本的环境
        external: ["process-bundle"], //! UMD 不能去除
        input: "./src/Evaluator.ts",
        output: {
            file: "./dist/Evaluator.umd.js",
            format: "umd",
            name: "Evaluator",
            globals: {
                "process-bundle": "process", //! UMD 不能去除
            },
        },
        plugins: [
            ...plugins,

            analyze({
                summaryOnly: true,
                writeTo: (str) =>
                    outputFileSync("dist/Evaluator.analyze.txt", str),
            }),
        ],
    },
];
