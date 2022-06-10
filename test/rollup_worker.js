import { module } from "./runtime/rollup_worker.js";

import { Buffer } from "https://cdn.skypack.dev/buffer";
import { expect } from "chai";
import { localBuild } from "./runtime/web_worker_local.js";
describe("Rollup Compiler Worker 线程测试", () => {
    // console.log(module);
    it("brotli 压缩测试", () => {
        const originData = "some input";
        const compressedData = module.compress(Buffer.from(originData));
        const decompressedData = module.decompress(compressedData);

        expect(Buffer.from(decompressedData).toString("utf8")).to.eq(
            originData
        );
    });
    it("Web Worker 端口传递测试", () => {
        localBuild();
    });
});
