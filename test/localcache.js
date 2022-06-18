import { Cache } from "../dist/index.js";
import { expect } from "chai";

const store = localforage.createInstance({
    name: "__rollup_extensions__",
    driver: [
        localforage.INDEXEDDB,
        localforage.WEBSQL,
        localforage.LOCALSTORAGE,
    ],
});
const timeStore = localforage.createInstance({
    name: "__rollup_web_outTime__",
    driver: [
        localforage.INDEXEDDB,
        localforage.WEBSQL,
        localforage.LOCALSTORAGE,
    ],
});
describe("LocalCache 测试", () => {
    it("基础测试", async () => {
        // 读取过期数据测试

        const outTimeData = await Cache.extensions.get("test_message");
        expect(outTimeData).to.eq(null);

        // 写入测试
        await Cache.extensions.set("test_message", "1234567890");
        await store.getItem("test_message").then((res) => {
            expect(res).to.eq("1234567890");
        });
        await timeStore.getItem("__rollup_extensions__").then((res) => {
            expect(res)
                .to.above(Date.now() - 1000 * 60)
                .below(Date.now());
        });

        // 读取测试
        const data = await Cache.extensions.get("test_message");
        expect(data).to.eq("1234567890");

        await timeStore.setItem("__rollup_extensions__", 100);
    });
});
