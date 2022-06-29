import { module, port } from "./runtime/Fetcher.js";
import { FS } from "../dist/adapter/Fetcher/FSFetcher.js";

describe("Fetcher 替换测试 线程测试", async () => {
    console.log(module, FS);
    const fs = new FS("test");
    await Promise.all(
        [
            "../public/iframe/index.js",
            "../public/iframe/index.html",
            "../public/wasm/wasm.js",
        ].map(async (path) => {
            const index = new URL(path, import.meta.url).pathname;
            const dash = index.replace(/\/[^\/]*$/, "").split("/");
            await Promise.all(
                dash.map(async (_, i) => {
                    const front = dash.slice(0, i + 1);
                    if (front.length < 2) return;
                    await fs.promises.mkdir(front.join("/")).catch((e) => {});
                })
            );

            await fetch(index)
                .then((res) => res.text())
                .then(async (res) => {
                    return fs.promises.writeFile(index, res, {
                        encoding: "utf8",
                    });
                });
        })
    );
    await module.mount({
        container: document.body,
        src: "http://localhost:8888/package/rollup-web/public/iframe/index.html",
        port,
    });
});
