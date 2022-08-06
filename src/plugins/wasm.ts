import type { Plugin } from "rollup";
import { WebPlugin } from "../types";
import type { ModuleConfig } from "../adapter/web_module";
import { isURLString } from "../utils/isURLString";
export { wasmHelper } from "./wasm/wasmHelper";
import { checkExtension, wrapPlugin } from "../utils/wrapPlugin";
import { parseWasm } from "./wasm/wasmParse";

type Mode = "vite" | "node";
type ModeCreator = (url: string) => Mode;
type Config = { mode?: Mode | ModeCreator; extensions?: string[] };

/**
 * wasm 插件
 * @param mode vite 模式需要自己初始化；node 模式可以自动初始化，但是可能会导致错误
 */
const _wasm = (config: Config): WebPlugin => {
    return {
        name: "wasm",
        // 添加自己的忽略器，保证成功
        ChangeConfig(moduleConfig) {
            if (moduleConfig.ignore) {
                moduleConfig.ignore.push(import.meta.url);
            } else {
                moduleConfig.ignore = [import.meta.url];
            }
        },

        resolveId(thisFile, importer, { isEntry }) {
            const ext = checkExtension(thisFile, config.extensions!);
            // 只对 绝对路径进行拦截解析，
            if (isURLString(thisFile) && ext) {
                return { external: !isEntry, id: thisFile };
            }
        },
        async load(id) {
            const mode = config.mode
                ? typeof config.mode === "string"
                    ? config.mode
                    : config.mode(id)
                : "vite";
            switch (mode) {
                case "node":
                    return await toNodeMode(id);
                default:
                    return `
                    import { wasmHelper } from '${import.meta.url}'
                    export default opts => wasmHelper(opts, "${id}")`;
            }
        },
    };
};
/**
 * WASM 桥接插件, 和 vite 的使用方式类似
 * 删除了 inline 操作
 * https://vitejs.dev/guide/features.html#webassembly
 */
export const wasm = wrapPlugin(_wasm, {
    extensions: [".wasm"],
});

/*  以 nodejs 的方式自动解析 wasm 模块 */
async function toNodeMode(id: string) {
    const buffer = await fetch(id, { cache: "force-cache" }).then((res) =>
        res.arrayBuffer()
    );
    const { imports, exports } = await parseWasm(buffer);
    /** 获取 wasm 中的所需要的导入项 */
    const ImportFromWasm = imports
        .map(
            ({ from, names }, i) =>
                `const { ${names
                    .map((name, j) => `${name} : _import_${i}_${j}`)
                    .join(", ")} } = await import(${JSON.stringify(from)});`
        )
        .join("\n");

    /** 自动导入并初始化 wasm 程序 */
    const connectToWasm = `import {wasmHelper} from '${import.meta.url}';
        const __wasm_module__ = await wasmHelper({ ${imports
            .map(
                ({ from, names }, i) =>
                    `${JSON.stringify(from)}: { ${names
                        .map((name, j) => `${name}: _import_${i}_${j}`)
                        .join(", ")} }`
            )
            .join(", ")} }, ${JSON.stringify(id)}).then(res=>res.exports);`;
    /**  导出 wasm 所包含的数据 */
    const ExportAsModule = exports
        .map(
            (name) =>
                `export ${
                    name === "default" ? "default" : `const ${name} =`
                } __wasm_module__.${name};`
        )
        .join("\n");
    const result = `
    //${id};
    ${ImportFromWasm}
        
    ${connectToWasm}

    ${ExportAsModule}`;
    return result;
}
