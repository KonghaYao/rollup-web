import { module } from "./runtime/tsx.js";
// 测试代码
import { expect } from "chai";
describe("Tsx 测试", () => {
    console.log(module);
    it("基础渲染测试", () => {
        const dom = document.getElementById("solidjs-tsx");
        expect(dom.tagName).to.eq("HEADER");
        const mid = [...dom.children].map((i) => {
            return {
                id: i.tagName,
                innerHTML: i.innerHTML,
            };
        });
        expect(mid).to.deep.eq([
            { id: "P", innerHTML: "这是一个 SolidJS 的渲染测试" },
            {
                id: "A",
                innerHTML:
                    "Solid JS 是一个框架，这个 DOM 是由本地打包的哦！100",
            },
        ]);
    });
});
