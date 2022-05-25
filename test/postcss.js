// 导入打包产物
import { useRollup, web_module, sky_module } from "../dist/index.js";

import postcss from "../dist/plugins/postcss.js";
// 如果需要 less ，那么要载入 less
import "https://fastly.jsdelivr.net/npm/less@4.1.2/dist/less.min.js";
require._moduleReflect.set("less", window.less);

export const Postcss = async () => {
    const config = {
        input: "./public/postcss.js",
        output: {
            format: "es",
        },
        plugins: [
            web_module({
                extensions: [".js", ".css", ".less", ".sass", ".styl"],
                log(url) {
                    console.log("%cDownload " + url, "color:green");
                },
            }),
            sky_module({
                cdn: "https://cdn.skypack.dev/",
            }),
            // ! sass 和 stylus 不支持
            postcss({
                plugins: [],
                // 浏览器端不能激活使用自动寻找配置
                config: false,
                // 压缩代码
                minimize: false,
                sourceMap: false,
            }),
        ],
    };
    const res = await useRollup(config);
    console.log(res);
    return res.output[0].code;
};
