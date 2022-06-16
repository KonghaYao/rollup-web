import { Plugin } from "rollup-web";
import type { BabelFileResult, TransformOptions } from "@babel/core";
import { transform } from "@babel/core";
import { wrapPlugin } from "../utils/wrapPlugin";

export const _babel = ({
    /** 写入配置文件 */
    babelrc = {},
    /** 默认使用 globalThis.Babel，这里可以替换 */
    log,
}: {
    babelrc?: TransformOptions;
    Babel?: object;
    extensions?: string[];
    log?: (id: string) => void;
} = {}) => {
    return {
        name: "babel-core",
        /** wrapPlugin 提供了 extensions 守护，id 必然是符合的 */
        transform(code: string, id: string) {
            const result = transform(code, {
                filename: id,
                ...babelrc,
            }) as BabelFileResult;
            log && log(id);
            return result;
        },
    } as Plugin;
};
/* Babel 桥接插件 */
export const babelCore = wrapPlugin(_babel, {
    extensions: [".js", ".jsx", ".es6", ".es", ".mjs"],
});
