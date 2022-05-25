import { dirname, resolve } from "../shim/path";
/** 转化相对地址的方式 */
export const relativeResolve = (from: string, to: string, relative = "/") =>
    resolve(relative, dirname(from), to);
