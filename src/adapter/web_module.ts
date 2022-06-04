import { addExtension } from "@rollup/pluginutils";
import { Plugin } from "rollup";
import { isURLString } from "../utils/isURLString";
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

/* 后缀名缓存器，用于下载不知道后缀名的文件 */
export class ExtensionCache {
    store = new Map<string, string>();
    constructor(public tag: string) {
        this.refresh();
    }
    refresh() {
        const text = globalThis.localStorage.getItem(this.tag);
        if (text) {
            const data: [string, string][] = JSON.parse(text);
            data.forEach(([key, value]) => this.store.set(key, value));
        }
    }
    add(path: string, url: string) {
        this.store.set(path, url);
        globalThis.localStorage.setItem(
            this.tag,
            JSON.stringify([...this.store.entries()])
        );
    }
    get(path: string) {
        return this.store.get(path);
    }
}
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
    /* 使用后缀名缓存，不缓存文件,默认是全局都是采用这个标记的缓存区间 */
    cache = "module_info",
    forceDependenciesExternal = false,

    logExternal = () => {},
}: ModuleConfig = {}) => {
    return {
        name: "web_module",
        /** 现在这里进行文件获取，load 的时候直接获取缓存文件 */
        async resolveId(thisFile, importer = "", { isEntry }) {
            const first = thisFile.charAt(0);
            if (isURLString(thisFile) || first === "." || first === "/") {
                /* 相对位置解析为相对于 root 的 URL 地址 */
                const importerWeb = new URL(importer, root);
                let resolved = new URL(thisFile, importerWeb);
                const url = resolved.toString();

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

                    for (let ext of extensions) {
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
        // wrapPlugin 进行了一层过滤
        async load(id: string) {
            const code = await fetch(id, { cache: "force-cache" }).then((res) =>
                res.text()
            );
            log && log(id);
            return { code };
        },
    } as Plugin;
};
/** 将相对路径解析到 web 地址的解析器，一般用于打包在线模块 */
export const web_module = wrapPlugin(_web_module, {
    extensions: [".js"],
});
