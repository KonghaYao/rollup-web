import { module } from "./runtime/vue3.js";
// 测试代码
import { expect } from "chai";
describe("Vue3 测试", () => {
    console.log(module);
    it("基础渲染测试", () => {
        const test = document.getElementById("vue3").innerHTML;
        console.log(test);
        expect(test).to.eq(
            ' Vue3 编辑 {"_buildDate_":3434,"_buildVersion_":15}'
        );
    });
});
