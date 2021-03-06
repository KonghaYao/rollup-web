import "../shim/process";
import { Plugin } from "rollup";
import { BabelFileResult, TransformOptions } from "@babel/core";
import { wrapPlugin } from "../utils/wrapPlugin";
import { loadScript } from "../utils/loadScript";
import { Setting } from "../Setting";
import { log as Log } from "../utils/ColorConsole";
/** 兼容以前的项目 在 Web 端全局加载一次 babel */
export const initBabel = async (babelURL?: string) => {
    // 这一步会进行去重操作，所以可以重复操作
    return loadScript(
        babelURL || Setting.NPM("@babel/standalone/babel.min.js"),
        {
            cacheTag: "babel",
        }
    ).then(() => {
        /* @ts-ignore */
        return globalThis.Babel;
    });
};
export const _babel = ({
    /** 写入配置文件 */
    babelrc = {},
    /** 默认使用 globalThis.Babel，这里可以替换 */
    Babel,
    log,
}: {
    babelrc?: TransformOptions;
    Babel?: object;
    extensions?: string[];
    log?: (id: string) => void;
} = {}) => {
    return {
        name: "babel",

        async buildStart() {
            Log.lime("Loading Babel.standalone.js ...");
            /* @ts-ignore */
            await initBabel();
        },
        /** wrapPlugin 提供了 extensions 守护，id 必然是符合的 */
        transform(code: string, id: string) {
            const result = (
                typeof Babel === "object" ? Babel : (globalThis as any).Babel
            ).transform(code, {
                filename: id,
                ...babelrc,
            }) as BabelFileResult;
            log && log(id);
            return result;
        },
    } as Plugin;
};
/* Babel 桥接插件 */
export const babel = wrapPlugin(_babel, {
    extensions: [".js", ".jsx", ".es6", ".es", ".mjs"],
});
