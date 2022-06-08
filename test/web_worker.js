import { module, classic } from "./runtime/web_worker.js";

import { expect } from "chai";
describe("Web Worker 测试", () => {
    console.log(module);
    it("module: brotli-wasm 在线编译", async () => {
        const moduleExport = await module();
        console.log(moduleExport);
    });
    it("classic: 基础编译", async () => {
        const classicExport = await classic();
        console.log(classicExport);
    });
});
