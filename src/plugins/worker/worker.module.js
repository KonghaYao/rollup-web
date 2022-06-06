import { Evaluator } from "https://fastly.jsdelivr.net/npm/rollup-web/dist/index.js";
import { wrap } from "https://fastly.jsdelivr.net/npm/comlink/dist/esm/comlink.mjs";
const Eval = new Evaluator();

globalThis.addEventListener(
    "message",
    (e) => {
        if (e.data && e.data.password === "__rollup_init__" && e.data.port) {
            Eval.createEnv({
                Compiler: wrap(e.data.port),
            })
                .then(() => {
                    console.log("Worker 环境布置完成");
                    postMessage("init");
                })
                .then(() => {
                    // 重新刷新 SystemJS 的初始化
                    const importMap = {
                        imports: {},
                        scopes: {},
                        depcache: {},
                        integrity: {},
                    };
                    const systemJSPrototype = globalThis.System;
                    var instantiate = systemJSPrototype.instantiate;
                    var jsContentTypeRegEx =
                        /^(text|application)\/(x-)?javascript(;|$)/;
                    systemJSPrototype.instantiate = function (url, parent) {
                        var loader = this;
                        if (!this.shouldFetch(url))
                            return instantiate.apply(this, arguments);
                        return this.fetch(url, {
                            credentials: "same-origin",
                            integrity: importMap.integrity[url],
                        }).then(function (res) {
                            if (!res.ok)
                                throw Error(
                                    errMsg(
                                        7,
                                        process.env.SYSTEM_PRODUCTION
                                            ? [
                                                  res.status,
                                                  res.statusText,
                                                  url,
                                                  parent,
                                              ].join(", ")
                                            : res.status +
                                                  " " +
                                                  res.statusText +
                                                  ", loading " +
                                                  url +
                                                  (parent
                                                      ? " from " + parent
                                                      : "")
                                    )
                                );
                            var contentType = res.headers.get("content-type");
                            if (
                                !contentType ||
                                !jsContentTypeRegEx.test(contentType)
                            )
                                throw Error(
                                    errMsg(
                                        4,
                                        process.env.SYSTEM_PRODUCTION
                                            ? contentType
                                            : 'Unknown Content-Type "' +
                                                  contentType +
                                                  '", loading ' +
                                                  url +
                                                  (parent
                                                      ? " from " + parent
                                                      : "")
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
                });
        }
    },
    { once: true }
);
globalThis.addEventListener("message", (e) => {
    if (e.data && e.data.password === "__rollup_evaluate__" && e.data.url) {
        Eval.evaluate(e.data.url).then((res) => {
            console.warn("worker receive: ", res);
        });
    }
});
