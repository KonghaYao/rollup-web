import { module } from "./runtime/wasm.js";
import { Buffer } from "https://cdn.skypack.dev/buffer";
// 测试代码
import { expect } from "chai";
describe("wasm 测试", () => {
    console.log(module);
    it("brotli 压缩测试", () => {
        const originData = "some input";
        const compressedData = module.compress(Buffer.from(originData));
        const decompressedData = module.decompress(compressedData);

        expect(Buffer.from(decompressedData).toString("utf8")).to.eq(
            originData
        );
    });
});
