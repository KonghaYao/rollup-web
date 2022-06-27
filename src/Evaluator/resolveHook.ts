import { useGlobal } from "../utils/useGlobal";
import {
    resolveAndComposeImportMap,
    resolveIfNotPlainOrUrl,
    resolveImportMap,
    /* @ts-ignore */
} from "./System/common.js";
export interface ImportMap {}

/* 添加 ImportMap 尝试 */
export const resolveHook = (importMap: ImportMap = {}, baseURL: string) => {
    importMap = Object.assign(
        {
            imports: {},
            scopes: {},
            depcache: {},
            integrity: {},
        },
        importMap
    );

    const System = useGlobal<any>("System");
    const systemJSPrototype = System.constructor.prototype;
    // 向外暴露 importMap
    systemJSPrototype.importMap = importMap;
    // 注入扩展 importMap 的函数
    systemJSPrototype.extendsImportMap = function (
        newMap: ImportMap,
        newMapUrl = baseURL
    ) {
        resolveAndComposeImportMap(newMap, newMapUrl, this.importMap);
    };

    // 覆盖 resolve
    const oldResolve = systemJSPrototype.resolve;
    systemJSPrototype.resolve = function (id: string, parentUrl = baseURL) {
        return (
            resolveImportMap(
                this.importMap,
                resolveIfNotPlainOrUrl(id, parentUrl) || id,
                parentUrl
            ) || oldResolve(id, parentUrl)
        );
    };
};
