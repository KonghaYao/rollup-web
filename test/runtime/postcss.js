// 导入打包产物
import { Compiler, sky_module } from "../../dist/index.js";
import { postcss } from "../../dist/plugins/postcss.js";
import { less } from "../../dist/plugins/less.js";
import { sass } from "../../dist/plugins/sass.js";

const config = {
    plugins: [
        less({
            log(id) {
                console.warn("less ", id);
            },
        }),
        sass({
            log(id, code) {
                console.warn("sass ", id);
            },
        }),
        postcss({
            plugins: [],
            options(css, id) {
                return { from: id, to: id };
            },
            log(id, code) {
                console.warn("postcss ", id);
            },
            extensions: [".css", ".less", ".sass", ".scss"],
        }),
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
    extensions: [".css", ".less", ".sass", ".scss", ".stylus"],
    log(url) {
        console.log("%cDownload " + url, "color:green");
    },
});
import { Evaluator } from "../../dist/index.js";
const Eval = new Evaluator();
await Eval.createEnv({
    Compiler: compiler,
});
export const module = await Eval.evaluate("./public/css/postcss.css");
