// 导入打包产物
import { Compiler, sky_module } from "../../dist/index.js";
import { postcss } from "../../dist/plugins/postcss.js";
// import styles from "../../dist/plugins/styles.js";
const config = {
    plugins: [
        // styles(),
        postcss({
            plugins: [],
            options(css, id) {
                return { from: id, to: id };
            },
            extensions: [".css", ".less"],
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
    extensions: [".css", ".less", "sass", ".scss", ".stylus"],
    log(url) {
        console.log("%cDownload " + url, "color:green");
    },
    // 纳入打包的 url 地址，使用 picomatch 匹配
    bundleArea: [window.location.origin + "/**"],
});
export const module = await compiler.evaluate("./public/css/index.css");
