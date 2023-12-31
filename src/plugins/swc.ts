import { Plugin } from "rollup";

import type { Options } from "@swc/core";
import merge from "lodash-es/merge";
import { log as Log } from "../utils/ColorConsole";
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
    log?: (id: string, code: string) => void;
} = {}) => {
    return {
        name: "swc",
        async buildStart(this, options) {
            if (initialized) return;
            Log.lime("Downloading SWC ...");
            await initSwc();
            initialized = true;
        },
        /** wrapPlugin 进行了守护 */
        transform(code: string, id: string) {
            const result = transformSync(
                code,
                merge({ filename: id }, defaultConfig, swcrc)
            );
            log && log(id, result);
            return result;
        },
    } as Plugin;
};

/** 使用 swc 前请 initSwc  */
export const swc = wrapPlugin(_swcPlugin, {
    extensions: [".js", ".ts", ".jsx", ".es6", ".es", ".mjs"],
});
