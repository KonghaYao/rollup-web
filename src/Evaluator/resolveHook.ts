import merge from "lodash-es/merge";
import { useGlobal } from "src/utils/useGlobal";
interface ImportMap {}
export const resolveHook = async (importMap: ImportMap = {}) => {
    importMap = merge(
        {
            imports: {},
            scopes: {},
            depcache: {},
            integrity: {},
        },
        importMap
    );
    const {
        /* @ts-ignore */
        resolveAndComposeImportMap,
        /* @ts-ignore */
        resolveIfNotPlainOrUrl,
        /* @ts-ignore */
        resolveImportMap,
    } = await import(
        "https://fastly.jsdelivr.net/gh/systemjs/systemjs@6.12.1/src/common.js"
    );
    const System = useGlobal<any>("System");
    const systemJSPrototype = System.__proto__ || System.prototype;
    // 向外暴露 importMap
    systemJSPrototype.importMap = importMap;
    // 注入扩展 importMap 的函数
    systemJSPrototype.extendImportMap = function (
        newMap: ImportMap,
        newMapUrl = globalThis.location.href
    ) {
        resolveAndComposeImportMap(newMap, newMapUrl, this.importMap);
    };

    // 覆盖 resolve
    const oldResolve = systemJSPrototype.resolve;
    systemJSPrototype.resolve = function (
        id: string,
        parentUrl = globalThis.location.href
    ) {
        return (
            resolveImportMap(
                this.importMap,
                resolveIfNotPlainOrUrl(id, parentUrl) || id,
                parentUrl
            ) || oldResolve(id, parentUrl)
        );
    };
};
