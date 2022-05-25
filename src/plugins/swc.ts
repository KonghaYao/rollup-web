import "../shim/process";
import { Plugin } from "rollup-web";

import { Options, transformSync } from "@swc/core";
import { merge } from "lodash-es";

// 导出所有的 Swc 选项
import initSwc from "@swc/core";
import { wrapPlugin } from "../utils/wrapPlugin";
export { initSwc };
export * from "@swc/core";

export const _swcPlugin = ({
    /** 写入配置文件 */
    swcrc = {},
    log,
}: {
    swcrc?: Options;
    extensions?: string[];
    log?: (id: string) => void;
} = {}) => {
    const defaultConfig = {
        jsc: {
            parser: {
                syntax: "typescript",
                tsx: true,
                decorators: true,
                dynamicImport: true,
            },
            transform: {
                legacyDecorator: true,
                decoratorMetadata: true,
            },
            target: "es2022",
            keepClassNames: true,
            loose: true,
        },
        module: {
            type: "es6",
            strict: false,
            strictMode: true,
            lazy: false,
            noInterop: false,
        },
        sourceMaps: false,
    };
    return {
        name: "swc",
        /** wrapPlugin 进行了守护 */
        transform(code: string, id: string) {
            log && log(id);
            return transformSync(
                code,
                merge({ filename: id }, defaultConfig, swcrc)
            );
        },
    } as Plugin;
};

/** 使用 swc 前请 initSwc  */
export const swcPlugin = wrapPlugin(_swcPlugin, {
    extensions: [".js", ".ts", ".jsx", ".es6", ".es", ".mjs"],
});
