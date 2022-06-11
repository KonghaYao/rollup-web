import { Plugin, PluginCache } from "rollup-web";
import { checkExtension, wrapPlugin } from "../utils/wrapPlugin";
import type { APIOptions } from "assemblyscript/dist/asc";
import merge from "lodash-es/merge";
import { URLDir, URLResolve } from "../utils/isURLString";
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
    let cache: PluginCache = new Map();
    let asc: typeof import("assemblyscript/dist/asc")["default"];
    merge(asconfig, {
        options: {
            importTable: false,
            exportRuntime: true,
            bindings: "esm",
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
            const url = name.replace(/(https?:\/)/, "$1/");
            Log.lime("wasm Build: " + url);
            const ext = checkExtension(name, [".js", ".wasm"]);
            if (ext) {
                if (data instanceof Uint8Array) {
                    const localURL = URL.createObjectURL(
                        new File([data], url, { type: "application/wasm" })
                    );
                    cache.set(url, localURL);
                } else {
                    const code = (data as any as string).replace(
                        'new URL("module.wasm", import.meta.url)',
                        `'${cache.get(
                            url.replace("module.js", "module.wasm")
                        )}'`
                    );
                    cache.set(url, code);
                }
            } else {
                cache.set(url, data);
            }
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

        async buildStart(this) {
            // 加载 asc
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
        resolveId(thisFile) {
            // 所有被解析的 url 将会在这个阶段被直接 resolve
            if (cache.has(thisFile)) return thisFile;
        },
        async load(id: string) {
            if (cache.has(id)) return cache.get(id);

            // 使用参数传递
            if (id.endsWith("?assemblyscript")) {
                await asc.main(
                    [id, "--config", "asconfig.json", "--baseDir", URLDir(id)],
                    ascRuntime
                );
                const url = URLResolve("./module.js", id);
                await this.load({ id: url });
                log && log(id);
                return `export *  from "${url}"`;
            }
        },
    } as Plugin;
};
/* Babel 桥接插件 */
export const assemblyscript = wrapPlugin(_assemblyscript, {
    extensions: [".as", ".ts", ".js"],
});
