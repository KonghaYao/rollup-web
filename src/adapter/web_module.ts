import { Plugin } from "rollup";
import { isMatch } from "picomatch";
import { addExtension } from "@rollup/pluginutils";
import { isURLString, URLResolve } from "../utils/isURLString";
import { extname } from "../shim/_/path";
import { wrapPlugin } from "../utils/wrapPlugin";

/* 文件缓存器 */
const fileCache = new Set<string>();
const isExist = async (url: string) => {
    if (fileCache.has(url)) {
        return url;
    } else {
        try {
            await fetch(url).then((res) => {
                if (res.ok) {
                } else {
                    throw new Error("错误");
                }
            });
            fileCache.add(url);
            return url;
        } catch (e) {
            return;
        }
    }
};

export interface ModuleConfig {
    /* 本地引用强制设置为忽略解析 */
    forceDependenciesExternal?: boolean;
    root?: string;
    log?: (string: string) => void;
    logExternal?: (url: string) => void;
    /* 用于没有设置后缀名时的猜测函数，并具有筛选功能 */
    extensions?: string[];
    /* 不缓存文件 */
    cache?: string | false;
    /* 额外的打包区域，使用 picomatch 进行 url 匹配 */
    extraBundle?: true | string[];
}

/* 最终 resolve 的返回值 */
const returnResult = (
    forceDependenciesExternal: boolean,
    result: string,
    isEntry: boolean,
    logExternal?: ModuleConfig["logExternal"]
) => {
    if (!isEntry && forceDependenciesExternal && logExternal)
        logExternal(result);
    return {
        external: isEntry ? false : forceDependenciesExternal,
        id: result,
    };
};

const _web_module = ({
    /* 必须为绝对地址 */
    root = window.location.href,
    /** 在 load 之前进行 log */
    log,
    extensions = [],
    extraBundle,
    forceDependenciesExternal = false,
    logExternal = () => {},
}: ModuleConfig = {}) => {
    return {
        name: "web_module",
        /** 现在这里进行文件获取，load 的时候直接获取缓存文件 */
        async resolveId(thisFile, importer = "", { isEntry }) {
            const first = thisFile.charAt(0);
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

                    const current = this.cache.get(url);

                    if (current) {
                        await isExist(current);
                        return returnResult(
                            forceDependenciesExternal,
                            current,
                            isEntry,
                            logExternal
                        );
                    }

                    //! 添加一个 空白字符的检测，可能空白字符就找到了，所以可以解析
                    for (let ext of ["", ...extensions]) {
                        const result = await isExist(addExtension(url, ext));
                        if (result) {
                            this.cache.set(url, result);
                            return returnResult(
                                forceDependenciesExternal,
                                result,
                                isEntry,
                                logExternal
                            );
                        }
                    }
                } else {
                    /* 绝对位置或者为模块 */
                    const id = await isExist(url);
                    return id
                        ? returnResult(
                              forceDependenciesExternal,
                              id,
                              isEntry,
                              logExternal
                          )
                        : id;
                }
            }
            return;
        },
        // 取消 wrapPlugin 的 load 封装，只要是落到 这里的 url 都将会被 load
        async load(id: string) {
            try {
                const code = await fetch(id, { cache: "force-cache" }).then(
                    (res) => {
                        if (res.ok) {
                            return res.text();
                        } else {
                            throw new Error("错误");
                        }
                    }
                );
                log && log(id);
                return { code };
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
