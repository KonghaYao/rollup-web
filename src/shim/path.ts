export * from "./_/path";
import * as path from "./_/path";

export const win32 = {
    sep: "\\",
    delimiter: ";",
    ...path,
};
// 需要额外导出这两项
export const sep = "/";
export const delimiter = ":";
export const posix = {
    sep,
    delimiter,
    ...path,
};
const PATH = {
    ...path,
    win32,
    posix,
};
export default PATH;
