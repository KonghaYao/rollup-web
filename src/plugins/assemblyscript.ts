import { Plugin, PluginCache } from "rollup-web";
import { wrapPlugin } from "../utils/wrapPlugin";
import type { APIOptions } from "assemblyscript/dist/asc";
import merge from "lodash-es/merge";
import { bareURL, URLDir, URLResolve } from "../utils/isURLString";
import { log as Log } from "../utils/ColorConsole";
const paths = {
    imports: {
        binaryen:
            "https://fastly.jsdelivr.net/npm/binaryen@108.0.0-nightly.20220528/index.js",
        long: "https://fastly.jsdelivr.net/npm/long@5.2.0/index.js",
        assemblyscript:
            "https://fastly.jsdelivr.net/npm/assemblyscript@0.20.8/dist/assemblyscript.js",
        "assemblyscript/asc":
            "https://fastly.jsdelivr.net/npm/assemblyscript@0.20.8/dist/asc.js",
    },
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
    let cache: PluginCache;
    let asc: typeof import("assemblyscript/dist/asc")["default"];
    merge(asconfig, {
        options: {
            importTable: true,
            exportRuntime: true,
            bindings: true,
        },
        targets: {
            release: {
                optimize: false,
                outFile: "module.wasm",
            },
        },
    });
    // TODO 接洽文件系统
    const ascRuntime = {
        readFile(name, baseDir) {
            if (name === "asconfig.json") {
                return JSON.stringify(asconfig);
            } else {
                return fetch(URLResolve(name, baseDir)).then((res) =>
                    res.text()
                );
            }
        },
        writeFile(name, data, baseDir) {
            Log.lime("wasm Build: " + name);
            cache.set(URLResolve(name, URLResolve("./build/", baseDir)), data);
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

    return {
        name: "assemblyscript",

        async buildStart(this, options) {
            if (!asc) {
                Log.green("Loading asc...");
                try {
                    const module = await import("assemblyscript/dist/asc");
                    asc = module.default;
                } catch (e) {
                    throw new Error(
                        "assemblyscript | place add this to your importsmap, \n" +
                            JSON.stringify(paths, null, 4)
                    );
                }
            }
        },
        async load(id: string) {
            cache = this.cache;
            this.cache.has(id);
            if (this.cache.has(id)) return this.cache.get(id);
            if (id.endsWith("?assemblyscript")) {
                const result = await asc.main(
                    [id, "--config", "asconfig.json", "--baseDir", URLDir(id)],
                    ascRuntime
                );
                // console.log(cache.get(buildDir));
                console.log(result);
                return "";
            }
        },
    } as Plugin;
};
/* Babel 桥接插件 */
export const assemblyscript = wrapPlugin(_assemblyscript, {
    extensions: [".as", ".ts"],
});
