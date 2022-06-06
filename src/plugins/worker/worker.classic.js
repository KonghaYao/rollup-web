// 这里引用了 CDN 进行加载
globalThis.module = {};
importScripts("https://fastly.jsdelivr.net/npm/process/browser.js");
importScripts("https://unpkg.com/comlink/dist/umd/comlink.js");
importScripts("http://localhost:8888/package/rollup-web/dist/Evaluator.umd.js");

const Evaluator = globalThis.Evaluator.Evaluator;
const Eval = new Evaluator();

globalThis.addEventListener(
    "message",
    (e) => {
        if (e.data && e.data.password === "__rollup_init__" && e.data.port) {
            Eval.createEnv({
                Compiler: Comlink.wrap(e.data.port),
                worker: "classic",
                root: e.data.localURL,
            })
                .then(() => {
                    async function fakeImport(url) {
                        return System.fetch(url)
                            .then((res) => {
                                return res.text();
                            })
                            .then((i) => {
                                console.log(i);
                                return eval(i);
                            });
                    }
                    globalThis.__importScripts = globalThis.importScripts;
                    globalThis.importScripts = (...urls) => {
                        return urls.reduce((col, cur) => {
                            return col.then(() => {
                                System.import(
                                    new URL(cur, e.data.localURL).toString()
                                );
                            });
                        }, Promise.resolve());
                    };
                    System.instantiate = function (url) {
                        var loader = this;
                        return Promise.resolve().then(async function () {
                            await fakeImport(url);
                            const result = loader.getRegister(url);
                            console.log(result[1]);
                            return result;
                            // return result;
                        });
                    };
                })
                .then(() => {
                    // 必须要返回一个值来表示完成了加载
                    postMessage("__rollup_ready__");
                });
        }
    },
    { once: true }
);

globalThis.addEventListener("message", (e) => {
    if (e.data && e.data.password === "__rollup_evaluate__" && e.data.url) {
        Eval.evaluate(e.data.url).then((res) => {
            console.warn("classic worker receive: ", res);
        });
    }
});
