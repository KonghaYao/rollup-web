import { module, classic } from "./runtime/web_worker.js";

import { expect } from "chai";
describe("Web Worker 测试", () => {
    console.log(module);
    it("module: brotli-wasm 在线编译", () => {
        return module();
    });
    it("classic: 基础编译", () => {
        return classic();
    });
});
