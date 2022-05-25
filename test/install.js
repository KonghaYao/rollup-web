import mocha from "https://fastly.jsdelivr.net/npm/mocha/mocha.js/+esm";
import { tsTest } from "./typescript.js";
import { tsxTest } from "./tsx.js";
import { Visualizer } from "./visualizer.js";
import { moduleDependencies } from "./moduleDependencies.js";
import { nodeNativeTest } from "./resolve.js";
import { pluginUtilTest } from "./plugin-utils.js";
import { DynamicImport } from "./dynamic.js";
import { Postcss } from "./postcss.js";
import { vueTest } from "./vue3.js";
import { ModuleEval } from "../dist/index.js";
import { expect } from "https://fastly.jsdelivr.net/npm/chai/+esm";
// 不能使用对象的方式进行 mocha 配置，不然会出错
mocha.setup("bdd");
mocha.checkLeaks();

describe("框架测试", function () {
    let collection = [];
    let count = 0;
    beforeEach(() => {
        console.group(collection[count]);
    });
    afterEach(() => {
        console.groupEnd();
        count++;
    });
    const it = (...args) => {
        collection.push(args[0]);
        return window.it.apply(this, args);
    };
    it("postcss 基础测试", async () => {
        const code = await Postcss();
        const module = await ModuleEval(code);
        console.log("nodeNative ==>", module);
    });
    it("vue3 基础测试", async () => {
        const code = await vueTest();
        const module = await ModuleEval(code);
        console.log("Vue3 ==>", module);
    });
});

describe("浏览器打包测试", function () {
    let collection = [];
    let count = 0;
    beforeEach(() => {
        console.groupCollapsed(collection[count]);
    });
    afterEach(() => {
        console.groupEnd();
        count++;
    });
    const it = (...args) => {
        collection.push(args[0]);
        return window.it.apply(this, args);
    };
    it("异步导入测试", async () => {
        const code = await DynamicImport();
        const module = await ModuleEval(code);
        const dynamicResult = await module.getDynamic();
        console.log("dynamic ==>", module, dynamicResult);

        // 静态异步导入
        expect(dynamicResult.default).to.eql({
            a: "b",
        });
        expect(dynamicResult.a).to.eq("b");

        // 动态异步导入
        const editableResult = await module.getEditableImport("index");
        expect(editableResult).to.eql(dynamicResult);
    });
    it("typescript 打包测试", async () => {
        const code = await tsTest();
        const module = await ModuleEval(code);
        console.log("typescript ==>", module);
        expect(module.a).to.eql({ _buildDate_: 3434, _buildVersion_: 15 });
        expect(module.b).to.eq(window.process);
        expect(module.default).to.eql({ a: "b" });
    });

    it("tsx <SolidJS> 测试", async () => {
        const code = await tsxTest();
        const module = await ModuleEval(code);
        console.log("TSX ==>", module);
        expect(document.querySelector("header > a").href).to.eq(
            "https://github.com/solidjs/solid"
        );
    });

    it("plugin-util 插件通用功能测试", async () => {
        const code = await pluginUtilTest();
        const module = await ModuleEval(code);
        console.log("nodeNative ==>", module, { code });
        expect(module.a).to.eq(11);
        expect(module.path).to.eq("path");
    });
});

describe("插件测试", function () {
    let collection = [];
    let count = 0;
    beforeEach(() => {
        console.group(collection[count]);
    });
    afterEach(() => {
        console.groupEnd();
        count++;
    });
    const it = (...args) => {
        collection.push(args[0]);
        return window.it.apply(this, args);
    };
    it("Node 插件屏蔽测试", async () => {
        const code = await nodeNativeTest();
        const module = await ModuleEval(code);
        console.log("nodeNative ==>", module);
        expect(module.path);
        expect(module.a).to.eq(11);
    });
    it("打包分析测试", async () => {
        const code = await Visualizer();
        const module = await ModuleEval(code);
        //TODO
        console.log("Visualizer  ==>", module);
    });
    it("模块依赖获取测试", async () => {
        // TODO
        const code = await moduleDependencies();
        const module = await ModuleEval(code);
        console.log("moduleDependencies  ==>", module);
    });
});

mocha.run();
