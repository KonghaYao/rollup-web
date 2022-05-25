const __require = {
    _cdn: "https://cdn.jsdelivr.net/npm",
    resolve(path: string) {
        return path;
    },
    /** 用于存储 require 获取的包的一个函数 */
    _moduleReflect: new Map<string, any>(),
};
const _require = (id: string) => {
    return __require._moduleReflect.get(id);
};
(globalThis as any).require = Object.assign(_require, __require);
export default require;
