import { Plugin } from "rollup";
import { isMatch } from "picomatch";
import { addExtension } from "@rollup/pluginutils";
import { isURLString, URLResolve } from "../utils/isURLString";
import { extname } from "../shim/_/path";
import { wrapPlugin } from "../utils/wrapPlugin";
import { ExtensionsCache } from "../Cache";
import type { Fetcher } from "./Fetcher";
import { WebFetcher } from "./Fetcher/WebFetcher";

export interface ModuleConfig {
    root?: string;
    log?: (string: string) => void;
    /* 用于没有设置后缀名时的猜测函数，并具有筛选功能 */
    extensions?: string[];
    /* 不缓存文件 */
    cache?: string | false;
    /* 额外的打包区域，使用 picomatch 进行 url 匹配 */
    extraBundle?: true | string[];

    adapter?: Fetcher;
    ignore?: string[];
}

const _web_module = ({
    /* 必须为绝对地址 */
    root = globalThis.location.href,
    /** 在 load 之前进行 log */
    log,
    extensions = [],
    extraBundle,
    /* 可以自定义获取方式 */
    adapter = WebFetcher,
    ignore = [],
}: ModuleConfig = {}) => {
    const { isExist, readFile } = adapter;
    return {
        name: "web_module",
        api: {
            getAdapter() {
                return adapter;
            },
        },
        /** 现在这里进行文件获取，load 的时候直接获取缓存文件 */
        async resolveId(thisFile, importer = "", { isEntry }) {
            const first = thisFile.charAt(0);
            if (isURLString(thisFile) && isMatch(thisFile, ignore)) {
                return { external: !isEntry, id: thisFile };
            }
            // blob URL 直接返回即可
            if (thisFile.startsWith("blob:")) {
                return thisFile;
            }
            /* 是否存在于打包范围 */
            const isInArea =
                isURLString(thisFile) &&
                (thisFile.startsWith(new URL(root).origin) ||
                    extraBundle === true ||
                    isMatch(thisFile, extraBundle!));
            if (isInArea || first === "." || first === "/") {
                /* 相对位置解析为相对于 root 的 URL 地址 */
                const importerWeb = URLResolve(importer, root);
                let url = URLResolve(thisFile, importerWeb);

                if (extname(url) === "") {
                    /* 解析后缀名 */
                    const current = await ExtensionsCache.get(url);
                    if (current && (await isExist(current))) {
                        return { id: current, external: !isEntry };
                    }

                    //! 添加一个 空白字符的检测，可能空白字符就找到了，所以可以解析
                    for (let ext of ["", ...extensions]) {
                        const result = await isExist(addExtension(url, ext));
                        if (result) {
                            await ExtensionsCache.set(url, result);

                            return { id: result, external: !isEntry };
                        }
                    }
                } else {
                    /* 绝对位置或者为模块 */
                    const id = await isExist(url);
                    return id ? { external: !isEntry, id } : false;
                }
            }
            return;
        },
        // 取消 wrapPlugin 的 load 封装，只要是落到 这里的 url 都将会被 load
        async load(id: string) {
            // console.log("    ", id);
            try {
                const code = await readFile(id);
                log && log(id);
                return { code: `//${id};\n` + code };
            } catch (e) {
                return;
            }
        },
    } as Plugin;
};
/** 将相对路径解析到 web 地址的解析器，一般用于打包在线模块 */
export const web_module = wrapPlugin(
    _web_module,
    {
        extensions: [".js"],
    },
    { load: false }
);
