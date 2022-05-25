import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import multiInput from "rollup-plugin-multi-input";
import analyze from "rollup-plugin-analyzer";
import json from "@rollup/plugin-json";
import { writeFileSync } from "fs";
import alias from "@rollup/plugin-alias";
import fs from "fs";
import replace from "@rollup/plugin-replace";
/**
 * 删除文件夹下所有文件
 */
/** @ts-ignore */
function emptyDir(path) {
    const files = fs.readdirSync(path);
    files.forEach((file) => {
        const filePath = `${path}/${file}`;
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            emptyDir(filePath);
        } else {
            fs.unlinkSync(filePath);
            console.log(`删除${file}文件成功`);
        }
    });
}

emptyDir("./dist");
/*  
    统一的插件配置
 */
const plugins = [
    replace({
        __dirname: JSON.stringify(""),
    }),
    alias({
        entries: {
            path: "src/shim/path.ts",
            fs: "src/shim/fs.cjs",
            glob: "src/shim/glob/glob.js",
            process: "src/shim/process.ts",
            module: "src/shim/module.ts",
            url: "src/shim/url.ts",
            child_process: "src/shim/child_process.ts",
            zlib: "src/shim/zlib.ts",
            brotli: "src/shim/brotli.js",
            buffer: "src/shim/buffer.ts",
            os: "src/shim/os.ts",
            "generic-names": "src/shim/generic-names.ts",
            cssnano: "src/shim/cssnano.ts",
            "@rollup/pluginutils-bundle":
                "node_modules/@rollup/pluginutils/dist/es/index.js",
            "@rollup/pluginutils": "src/plugins/plugin-utils.ts",
            "rollup-pluginutils": "@rollup/pluginutils",
            "safe-identifier": "src/shim/safe-identifier.ts",
        },
    }),
    commonjs({
        transformMixedEsModules: true,
        ignoreDynamicRequires: true,
    }),
    resolve({
        browser: true,
        extensions: [".ts", ".js"],
        preferBuiltins: true,
    }),
    babel({
        presets: ["@babel/preset-typescript"],
        extensions: [".ts"],
        babelHelpers: "bundled",
    }),
];
// const pluginInput = "postcss";
const pluginInput = "*";
const NPMCDN = "https://fastly.jsdelivr.net/npm/";
/* 
    统一的 paths 替换项
*/
const paths = {
    "rollup-web": NPMCDN + "rollup/dist/es/rollup.browser.js",
    "@swc/core": NPMCDN + "@swc/wasm-web/wasm-web.js",
    "process-bundle": NPMCDN + "process/browser.js/+esm",
    "magic-string": NPMCDN + "magic-string/+esm",
    util: NPMCDN + "util/+esm",
    events: NPMCDN + "events/+esm",
    "os-bundle": NPMCDN + "os/+esm",
    punycode: NPMCDN + "punycode/+esm",
    "zlib-bundle": NPMCDN + "pako/+esm",
    "nv-browser-brotli": NPMCDN + "nv-browser-brotli/+esm",
    "safe-identifier-bundle": NPMCDN + "safe-identifier/+esm",

    assert: "https://cdn.skypack.dev/assert",
    "url-bundle": "https://cdn.skypack.dev/url",
    picomatch: "https://cdn.skypack.dev/picomatch",

    "buffer-bundle": "https://esm.sh/buffer",
    "source-map": "https://esm.sh/source-map",

    postcss: "https://esm.sh/postcss",
    "@vue/compiler-sfc": "https://cdn.skypack.dev/@vue/compiler-sfc",

    // uncheck

    "postcss-selector-parser": "https://esm.sh/postcss-selector-parser",

    yaml: "https://esm.sh/yaml",
    "concat-with-sourcemaps": "https://esm.sh/concat-with-sourcemaps",
};

export default [
    {
        external: ["rollup-web", "process-bundle", "picomatch"],
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
