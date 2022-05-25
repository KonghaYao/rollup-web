import { Plugin } from "rollup";
import { isURLString } from "../utils/isURLString";
type CDNCreator = (cdn: string) => string;
/**
 * 将模块路径解析到 Web ESM CDN
 * @param cdn "https://cdn.skypack.dev/"| "https://esm.run/" | "https://cdn.jsdelivr.net/" | "https://esm.sh/"
 * */
export const sky_module = ({
    /** esm CDN  的地址 */
    cdn = "https://cdn.skypack.dev/",
    /** 解析到模块时，自动替换名称的方式 */
    rename = {},
    /**
     *  白名单机制，如果提供了的话，就只能解析这个里面的依赖, 不提供则会全部进行解析，
     *  value 值为版本号，如果不填默认为最新版本
     */
    dependencies,
    ignore,
    /** ! 极度不推荐使用 ! 模块会被解析，需要有具有 load 功能的插件 */
    bundle = [],
}: {
    bundle?: string[];
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
            // 当有前缀时，进行 ignore
            if (/[^:]*?:/.test(thisFile)) return;
            if (
                thisFile[0] !== "." &&
                thisFile[0] !== "/" &&
                !isURLString(thisFile)
            ) {
                // 不在依赖表中的模块不解析
                if (dependencies && !(thisFile in dependencies)) return;
                if (ignore?.includes(thisFile)) return;
                // 重命名模块
                thisFile = thisFile in rename ? rename[thisFile] : thisFile;
                // 全解析
                return {
                    // 当模块需要被在线获取并解析时
                    external: !(thisFile in bundle),
                    id:
                        typeof cdn === "function"
                            ? cdn(thisFile)
                            : new URL(thisFile, cdn).toString(),
                };
            }
            return;
        },
    } as Plugin;
};
