// 导入打包产物
import { useRollup, sky_module, obj_module } from "../dist/index.js";

// 导入各种插件
import { nodeNative } from "../dist/plugins/resolve.js";
export const nodeNativeTest = async () => {
    const config = {
        input: "./public/test.js",
        output: {
            format: "es",
        },
        plugins: [
            nodeNative({
                log(id) {
                    console.log("nodeNative: ", id);
                },
            }),
            obj_module({
                files: {
                    public: {
                        "test.js": `
                    import {a} from '../data';
                    import path from 'path'
                    export {path,a}
                    `,
                    },
                    "data.js": `export const a = 11`,
                },
            }),

            sky_module({
                cdn: "https://cdn.skypack.dev/",
                log(url) {
                    console.log("%c" + url, "color:green");
                },
            }),
        ],
    };
    const res = await useRollup(config);
    return res.output[0].code;
};
