/* 创建 ESM 代码的 URL */
export const createModule = (str: string, fileName: string) => {
    return URL.createObjectURL(
        new File([str], fileName, { type: "application/javascript" })
    );
};

/** 解析 ESM 文本为 模块并导入的方式 */
export const ModuleEval = async (str: string, fileName = "index.js") => {
    const url = createModule(str, fileName);
    return import(/* @vite-ignore */ url).then((module) => {
        URL.revokeObjectURL(url);
        return module;
    });
};

/** 为 iife 文本添加 ESM 导出 */
export const IifeToESMEval = async (
    str: string,
    /** esm 更名导出，可以使用空字符串代表原来的名称 */
    exportMap: {
        [key: string]: string;
    }
) => {
    const exports = Object.entries(exportMap).reduce(
        (col, [variable, esmExport]) => {
            // ESM 更名导出
            const asExport =
                esmExport && esmExport !== variable ? `as ${esmExport}` : "";
            return col + `${variable} ${asExport},`;
        },
        ""
    );
    return `${str}
    export { ${exports} };
    `;
};
