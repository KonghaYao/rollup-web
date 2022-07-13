import { isMatch } from "picomatch";
import { Plugin } from "rollup";
import { isURLString, URLResolve } from "../utils/isURLString";
type CDNCreator = (cdn: string) => string;
/**
 * ! 将模块路径解析到 Web ESM CDN
 * @param cdn "https://cdn.skypack.dev/"| "https://esm.run/" | "https://fastly.jsdelivr.net/" | "https://esm.sh/"
 * */
export const sky_module = ({
    /** esm CDN  的地址 */
    cdn = "https://cdn.skypack.dev/",
    /** 解析到模块时，自动替换名称的方式 */
    rename = {},
    ignore,
}: {
    rename?: {
        [keys: string]: string;
    };
    dependencies?: {
        [keys: string]: string;
    };
    ignore?: string[];
    cdn?: string | CDNCreator;
} = {}) => {
    return {
        name: "sky_module",

        resolveId(thisFile, importer = "") {
            if (isURLString(thisFile)) return;
            // 当有前缀时，进行 ignore
            if (thisFile[0] !== "." && thisFile[0] !== "/") {
                if (ignore && isMatch(thisFile, ignore)) return;
                // 重命名模块
                thisFile = thisFile in rename ? rename[thisFile] : thisFile;
                // 全解析
                return {
                    // 当模块需要被在线获取并解析时
                    external: true,
                    id:
                        typeof cdn === "function"
                            ? cdn(thisFile)
                            : URLResolve(thisFile, cdn),
                };
            }
            return;
        },
    } as Plugin;
};
