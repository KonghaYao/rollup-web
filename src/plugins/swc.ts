import "../shim/process";
import { Plugin } from "rollup-web";

import type { Options } from "@swc/core";
import merge from "lodash-es/merge";

import initSwc, { transformSync } from "@swc/wasm-web";
import { wrapPlugin } from "../utils/wrapPlugin";
export { initSwc };
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

let initialized = false;
const _swcPlugin = ({
    /** 写入配置文件 */
    swcrc = {},
    log,
}: {
    swcrc?: Options;
    log?: (id: string) => void;
} = {}) => {
    return {
        async buildStart(this, options) {
            if (initialized) return;
            await initSwc();
            initialized = true;
        },
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
export const swc = wrapPlugin(_swcPlugin, {
    extensions: [".js", ".ts", ".jsx", ".es6", ".es", ".mjs"],
});
