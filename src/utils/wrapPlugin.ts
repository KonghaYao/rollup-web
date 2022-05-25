import { createFilter, FilterPattern } from "@rollup/pluginutils";
import type { Plugin, LoadHook, TransformHook, ResolveIdHook } from "rollup";
import { extname } from "../shim/_/path";
import { isURLString } from "./isURLString";
import { relativeResolve } from "./pathUtils";

/**
 * 检查文件后缀名,
 * @returns  ext 后缀名，没有后缀名为空字符，不符合后缀名则为 false
 * */
export const checkExtension = (path: string, extensions: string[]) => {
    const url = new URL(path);
    const ext = extname(url.origin + "/" + url.pathname);
    // console.log(extensions, ext, extensions.includes(ext));
    if (ext) {
        return extensions.includes(ext) && ext;
    } else {
        return "";
    }
};

export const checkPrefix = (path: string, prefix: string[]) => {
    return prefix.find((i) => path.startsWith(i));
};
export const checkSuffix = (path: string, prefix: string[]) => {
    return prefix.find((i) => path.endsWith(i));
};
interface ExtraOptions {
    exclude?: FilterPattern;
    include?: FilterPattern;
    extensions?: string[];
    loadCache?: false | string;
    _prefix?: string[];
    _suffix?: string[];
}
/** 对于插件的简单封装 */
export const wrapPlugin = <T>(
    creator: (options: T) => Plugin,
    defaultOptions: Partial<T & ExtraOptions>
) => {
    return function (options: T & ExtraOptions) {
        options = Object.assign({}, defaultOptions, options);
        const origin = creator.call(null, options);
        const p = {
            ...origin,
        };
        // 注意 ，filter 只使用于相对路径导入
        const filter = createFilter(options.include, options.exclude, {
            resolve: "/",
        });
        if (origin.resolveId) {
            p.resolveId = function (this, source, importer, options) {
                // importer 不存在说明是顶层文件，不能忽略
                if (
                    importer &&
                    !isURLString(importer) &&
                    !filter(relativeResolve(importer, source, "/"))
                )
                    return;

                return origin.resolveId!.call(this, source, importer, options);
            } as ResolveIdHook;
        }
        if (origin.load) {
            p.load = async function (id) {
                if (!isURLString(id) && !filter(id)) return;

                //! 前缀和后缀有一个符合即可
                if (
                    options._prefix &&
                    options._prefix.length &&
                    checkPrefix(id, options._prefix) &&
                    options._suffix &&
                    options._suffix.length &&
                    checkSuffix(id, options._suffix)
                ) {
                    // 前缀名检查
                    console.warn("通过前缀测试", id);
                } else if (options.extensions) {
                    // 后缀名检查
                    const result = checkExtension(id, options.extensions);
                    // console.log(id, extname(id), options, p);
                    if (result === false) return;
                }
                return origin.load!.call(this, id);
            } as LoadHook;
        }
        if (origin.transform) {
            p.transform = function (code, id) {
                // 所有文件都是load 过来的，所以文件都是有 http 开头的 id
                // transform 对于没有后缀名的进行
                const result = checkExtension(id, options.extensions!);
                if (
                    result ||
                    (result === "" && options.extensions?.includes(""))
                ) {
                    return origin.transform!.call(this, code, id);
                }
                return false;
            } as TransformHook;
        }
        return p;
    };
};
