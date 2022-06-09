import { module } from "./runtime/asc.js";
// 测试代码
import { expect } from "chai";
describe("AssemblyScript 测试", () => {
    console.log(module);
    it("普通编译测试", () => {
        const { total, result } = module;
        expect(total).to.eq(10);
        expect(result.length).to.eq(4);
    });
});
