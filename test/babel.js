import { module } from "./runtime/babel.js";
// 测试代码
import { expect } from "chai";
describe("Typescript 测试", () => {
    console.log(module);
    it("默认导出 + 导入 json 文件测试", () => {
        expect(module.default).to.deep.equal({
            a: "b",
        });
    });
    it("多导出 + 异步 import 测试", () => {
        expect(module.a).to.deep.equal({
            _buildDate_: 3434,
            _buildVersion_: 15,
        });
        return module
            .getDynamic()
            .then((res) => {
                expect(res.default).to.deep.eq({ a: "b" });
            })
            .then(() => {
                module.setData(100);
                return module.getData().then((res) => {
                    console.log(res);
                    expect(module.a._buildDate_).to.eq(res);
                });
            });
    });
    it("commonjs 测试", () => {
        expect(module.process).to.equal(window.process);
    });
});
