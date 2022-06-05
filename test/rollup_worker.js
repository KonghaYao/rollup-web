import { module } from "./runtime/rollup_worker.js";

import { expect } from "chai";
describe("wasm 测试", () => {
    console.log(module);
    it("brotli 压缩测试", () => {
        it("brotli 压缩测试", () => {
            const originData = "some input";
            const compressedData = module.compress(Buffer.from(originData));
            const decompressedData = module.decompress(compressedData);

            expect(Buffer.from(decompressedData).toString("utf8")).to.eq(
                originData
            );
        });
    });
});
