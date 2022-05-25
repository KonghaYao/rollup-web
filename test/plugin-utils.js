// 导入打包产物
import { useRollup, obj_module } from "../dist/index.js";
export const pluginUtilTest = async () => {
    const config = {
        // 如果使用 obj_module,需要使用绝对路径
        input: "./public/test",
        output: {
            format: "es",
        },
        plugins: [
            obj_module({
                files: {
                    public: {
                        "test.js": `
                        import {a} from '../data';
                        import path from "./path"
                        export {a,path}
                    `,
                    },
                    "data.js": `export const a = 11`,
                },
                log(id) {
                    console.log(id);
                },
                extensions: [".cjs", ".js"],
                include: ["public/test*", "data*"],
                exclude: ["public/path*"],
            }),
            // 上一个加载器不获取文件，这个加载器获取一个默认值给 test
            {
                resolveId() {
                    return "\0should be exclude";
                },
                load(id) {
                    console.log("被排除", id);

                    return 'export default "path";export const a = 12';
                },
            },
        ],
    };
    const res = await useRollup(config);
    return res.output[0].code;
};
