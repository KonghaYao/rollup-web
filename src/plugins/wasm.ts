import type { Plugin } from "rollup";
import { isURLString } from "../utils/isURLString";
import { wasmHelper } from "./wasm/wasmHelper";
import { setGlobal } from "../utils/useGlobal";
import { wrapPlugin } from "../utils/wrapPlugin";
import { parseWasm } from "./wasm/wasmParse";

const _wasm = (config: {
    /* 向全局注入的一个 wasm 转接器 */
    globalName?: string;
    mode?: "vite" | "node";
}): Plugin => {
    const globalName = config.globalName || "__rollup_web_wasm_helper__";
    setGlobal(globalName, wasmHelper);
    return {
        name: "wasm",
        resolveId(thisFile, importer) {
            // 只对 绝对路径进行拦截解析
            if (isURLString(thisFile)) {
                return thisFile;
            }
        },
        async load(id) {
            switch (config.mode) {
                case "node":
                    return await toNodeMode(id, globalName);
                default:
                    return `export default opts => globalThis.${globalName}(opts, "${id}")`;
            }
        },
    } as Plugin;
};
/**
 * WASM 桥接插件, 和 vite 的使用方式类似
 * 删除了 inline 操作
 * https://vitejs.dev/guide/features.html#webassembly
 */
export const wasm = wrapPlugin(_wasm, {
    extensions: [".wasm"],
});

/*  以 nodejs 的方式解析 wasm 模块 */
async function toNodeMode(id: string, globalName: string) {
    const buffer = await fetch(id, { cache: "force-cache" }).then((res) =>
        res.arrayBuffer()
    );
    const { imports, exports } = await parseWasm(buffer);
    // console.log(imports, exports);
    const ImportFromWasm = imports
        .map(
            ({ from, names }, i) =>
                `const { ${names
                    .map((name, j) => `${name} : _import_${i}_${j}`)
                    .join(", ")} } = await import(${JSON.stringify(from)});`
        )
        .join("\n");

    const ExportAsModule = exports
        .map(
            (name) =>
                `export ${
                    name === "default" ? "default" : `const ${name} =`
                } __wasm_module__.${name};`
        )
        .join("\n");
    const result = `${ImportFromWasm}

        const __wasm_module__ = await globalThis.${globalName}({ ${imports
        .map(
            ({ from, names }, i) =>
                `${JSON.stringify(from)}: { ${names
                    .map((name, j) => `${name}: _import_${i}_${j}`)
                    .join(", ")} }`
        )
        .join(", ")} }, ${JSON.stringify(id)}).then(res=>res.exports);
        ${ExportAsModule} `;
    console.log(result);
    return result;
}
