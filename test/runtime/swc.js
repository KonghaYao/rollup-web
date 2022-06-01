// 导入打包产物
import { Compiler, sky_module } from "../../dist/index.js";
import { swc } from "../../dist/plugins/swc.js";

// 导入各种插件
import json from "https://esm.sh/@rollup/plugin-json";
import alias from "https://esm.sh/@rollup/plugin-alias";
import commonjs from "https://esm.sh/@rollup/plugin-commonjs";
import replace from "https://esm.sh/@rollup/plugin-replace";

const config = {
    plugins: [
        json(),
        alias({
            entries: [{ find: "@", replacement: "." }],
        }),
        commonjs({
            extensions: [".cjs", ".js"],
        }),
        replace({
            __buildDate__: () => JSON.stringify(3434),
            __buildVersion: "15",
        }),
        swc({
            swcrc: {},
            extensions: [".ts"],
            log(id) {
                console.log("%cBabel typescript > " + id, "color:orange");
            },
        }),
        sky_module({
            cdn: "https://cdn.skypack.dev/",
        }),
        // 配合解析 ExtraBundle 的插件
        {
            resolveId(url) {
                if (url.startsWith("http")) {
                    return url;
                }
            },
            load(url) {
                return fetch(url).then((res) => res.text());
            },
        },
    ],
};
const compiler = new Compiler(config, {
    // 用于为相对地址添加绝对地址
    // 为没有后缀名的 url 添加后缀名
    extensions: [".ts", ".cjs", ".json"],
    log(url) {
        console.log("%c Download ==> " + url, "color:green");
    },
});
export const module = await compiler.evaluate("./public/test.ts");
