import "../shim/process";
import { Plugin } from "rollup-web";
import { BabelFileResult, TransformOptions } from "@babel/core";
import { wrapPlugin } from "../utils/wrapPlugin";

/** 在 Web 端全局加载一次 babel */
export const initBabel = async (babelURL?: string) => {
    return import(
        babelURL ||
            "https://fastly.jsdelivr.net/npm/@babel/standalone/babel.min.js"
    ).then(() => {
        /* @ts-ignore */
        return globalThis.Babel;
    });
};
export const _babel = ({
    /** 写入配置文件 */
    babelrc = {},
    /** 默认使用 window.Babel，这里可以替换 */
    Babel,
    log,
}: {
    babelrc?: TransformOptions;
    Babel?: any;
    extensions?: string[];
    log?: (id: string) => void;
} = {}) => {
    if (!Babel) Babel = (window as any).Babel;
    return {
        name: "babel",
        /** wrapPlugin 提供了 extensions 守护，id 必然是符合的 */
        transform(code: string, id: string) {
            const result = Babel.transform(code, {
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
