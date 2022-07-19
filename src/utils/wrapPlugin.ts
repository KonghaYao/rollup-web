import { createFilter, FilterPattern } from "@rollup/pluginutils";
import type {
    Plugin,
    LoadHook,
    TransformHook,
    ResolveIdHook,
    ResolveIdResult,
} from "rollup";
import { extname } from "../shim/_/path";
import { isURLString } from "./isURLString";
import { relativeResolve } from "./pathUtils";

/**
 * 检查文件后缀名,
 * @returns  ext 后缀名，没有后缀名为空字符，不符合后缀名则为 false
 * */
export const checkExtension = (path: string, extensions: string[]) => {
    const ext = extname(path.replace(/[#|?][^\/]*/, ""));
    // 空字符串视为 false
    return extensions.includes(ext) && ext;
};

export const checkSuffix = (path: string, suffix: string[]) => {
    return suffix.find((i) => path.endsWith(i));
};
export interface ExtraOptions {
    exclude?: FilterPattern;
    include?: FilterPattern;
    extensions?: string[];
    __modifyId?: (result: ResolveIdResult, importer: string) => ResolveIdResult;
    loadCache?: false | string;
    _suffix?: string[];
}

/** 对于插件的简单封装 */
export const wrapPlugin = <T>(
    creator: (options: T) => Plugin,
    defaultOptions: Partial<T & ExtraOptions>,
    /* 这里可以取消对某一个部分的 wrap */
    wrapOptions?: {
        // 默认是 true
        load?: boolean;
        resolveId?: boolean;
        transform?: boolean;
    }
): ((options: T & ExtraOptions) => Plugin) => {
    return function (Options: T & ExtraOptions) {
        Options = Object.assign({}, defaultOptions, Options);
        const origin = creator.call(null, Options);
        const p = {
            ...origin,
        };
        // 注意 ，filter 只使用于相对路径导入
        const filter = createFilter(Options.include, Options.exclude, {
            resolve: "/",
        });
        if (wrapOptions?.resolveId !== false && origin.resolveId) {
            p.resolveId = WrapResolveId<T>(filter, origin, Options);
        }
        if (wrapOptions?.load !== false && origin.load) {
            p.load = WrapLoad<T>(filter, Options, origin);
        }
        if (wrapOptions?.transform !== false && origin.transform) {
            p.transform = function (code, id) {
                // 所有文件都是load 过来的，所以文件都是有 http 开头的 id
                // transform 对于没有后缀名的进行
                const result = checkExtension(id, Options.extensions!);
                if (
                    result ||
                    (result === "" && Options.extensions?.includes(""))
                ) {
                    return origin.transform!.call(this, code, id);
                }
                return false;
            } as TransformHook;
        }
        return p;
    };
};

/* ResolveId 的 */
function WrapResolveId<T>(
    filter: (id: unknown) => boolean,
    origin: Plugin,
    Options: T & ExtraOptions
) {
    // resolve 不对 extensions 进行限制
    return function (this, source, importer, options) {
        // importer 不存在说明是顶层文件，不能忽略
        if (importer && !filter(relativeResolve(importer, source, "/"))) return;

        const result = origin.resolveId!.call(this, source, importer, options);

        // 添加修改 id 的操作
        if (Options.__modifyId && result) {
            return Promise.resolve(result).then((result) => {
                return Options.__modifyId!(result, importer || "");
            });
        }
        return result;
    } as ResolveIdHook;
}

/* load 会进行后缀名检查 */
function WrapLoad<T>(
    filter: (id: unknown) => boolean,
    Options: T & ExtraOptions,
    origin: Plugin
) {
    return async function (id) {
        if (!isURLString(id) && !filter(id)) return;

        //! 前缀和后缀有一个符合即可
        // vue3 使用 suffix 进行检测
        if (Options.extensions) {
            // 后缀名检查
            const result = checkExtension(id, Options.extensions);
            if (result === false) return;
        } else if (
            !(
                Options._suffix &&
                Options._suffix.length &&
                checkSuffix(id, Options._suffix)
            )
        ) {
            return;
        }
        return origin.load!.call(this, id);
    } as LoadHook;
}
