export interface WasmInfo {
    imports: {
        from: string;
        names: string[];
    }[];
    exports: string[];
}

export async function parseWasm(wasmBinary: ArrayBuffer): Promise<WasmInfo> {
    try {
        const wasmModule = await WebAssembly.compile(wasmBinary);
        const imports = Object.entries(
            WebAssembly.Module.imports(wasmModule).reduce(
                (result, item) => ({
                    ...result,
                    [item.module]: [...(result[item.module] || []), item.name],
                }),
                {} as Record<string, string[]>
            )
        ).map(([from, names]) => ({ from, names }));

        const exports = WebAssembly.Module.exports(wasmModule).map(
            (item) => item.name
        );

        return { imports, exports };
    } catch (e) {
        throw new Error(`Failed to parse WASM file: ${(e as Error).message}`);
    }
}
