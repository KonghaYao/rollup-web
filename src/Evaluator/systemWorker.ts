import { ModuleConfig } from "../adapter/web_module";
import { environment } from "./environment";

function errMsg(errCode: number, msg: any) {
    if (process.env.SYSTEM_PRODUCTION)
        return (msg || "") + " (SystemJS https://git.io/JvFET#" + errCode + ")";
    else
        return (
            (msg || "") +
            " (SystemJS Error#" +
            errCode +
            " " +
            "https://git.io/JvFET#" +
            errCode +
            ")"
        );
}
const importMap: any = {
    imports: {},
    scopes: {},
    depcache: {},
    integrity: {},
};
export const ModuleWorkerInit = () => {
    // 重新刷新 SystemJS 的初始化
    // 这个是 fetch-loader
    // 向单个环境中注入的参数
    /* @ts-ignore */
    const systemJSPrototype = globalThis.System;
    var instantiate = systemJSPrototype.instantiate;
    var jsContentTypeRegEx = /^(text|application)\/(x-)?javascript(;|$)/;
    systemJSPrototype.instantiate = function (url: string, parent: string) {
        var loader = this;
        if (!this.shouldFetch(url)) return instantiate.apply(this, arguments);
        return this.fetch(url, {
            credentials: "same-origin",
            integrity: importMap.integrity[url],
        }).then(function (res: Response) {
            if (!res.ok)
                throw Error(
                    errMsg(
                        7,
                        process.env.SYSTEM_PRODUCTION
                            ? [res.status, res.statusText, url, parent].join(
                                  ", "
                              )
                            : res.status +
                                  " " +
                                  res.statusText +
                                  ", loading " +
                                  url +
                                  (parent ? " from " + parent : "")
                    )
                );
            var contentType = res.headers.get("content-type");
            if (!contentType || !jsContentTypeRegEx.test(contentType))
                throw Error(
                    errMsg(
                        4,
                        process.env.SYSTEM_PRODUCTION
                            ? contentType
                            : 'Unknown Content-Type "' +
                                  contentType +
                                  '", loading ' +
                                  url +
                                  (parent ? " from " + parent : "")
                    )
                );
            return res.text().then(function (source) {
                if (source.indexOf("//# sourceURL=") < 0)
                    source += "\n//# sourceURL=" + url;
                (0, eval)(source);
                return loader.getRegister(url);
            });
        });
    };
};
