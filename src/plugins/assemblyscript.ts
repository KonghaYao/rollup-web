import { Plugin } from "rollup-web";
import { wrapPlugin } from "../utils/wrapPlugin";
import type { APIOptions } from "assemblyscript/dist/asc";
import merge from "lodash-es/merge";
import { URLResolve } from "../utils/isURLString";

// TODO 接洽文件系统
const createBind = (config: APIOptions) => {
    return {
        readFile(name, baseDir) {
            if (name === "asconfig.json") {
                return JSON.stringify(config);
            } else {
                return fetch(URLResolve(name, baseDir)).then((res) =>
                    res.text()
                );
            }
        },
        writeFile(name, data, baseDir) {
            console.log("wasn Build: ", name, data);
        },
        listFiles(dirname, baseDir) {
            return [];
        },
        stderr: {
            write(e) {
                console.error(e);
            },
        },
        stdout: {
            write(e) {
                console.info(e);
            },
        },
    } as APIOptions;
};
export const _assemblyscript = ({
    /** 写入配置文件 */
    asconfig = {},
    log,
}: {
    asconfig?: {};
    extensions?: string[];
    log?: (id: string) => void;
} = {}) => {
    let asc: typeof import("assemblyscript/dist/asc");
    merge(asconfig, {
        entries: ["./index.ts"],
        options: {
            importTable: false,
        },
        targets: {
            release: {
                optimize: false,
                outFile: "module.wasm",
            },
        },
    });
    return {
        name: "assemblyscript",
        /** wrapPlugin 提供了 extensions 守护，id 必然是符合的 */
        async load(id: string) {
            if (id.endsWith("?assemblyscript")) {
                const result = await asc.main(
                    ["index.ts", "--config", "asconfig.json"],
                    createBind(asconfig)
                );
            }
        },
    } as Plugin;
};
/* Babel 桥接插件 */
export const assemblyscript = wrapPlugin(_assemblyscript, {
    extensions: [".ts"],
});
