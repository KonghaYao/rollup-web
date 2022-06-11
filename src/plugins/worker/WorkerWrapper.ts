import { transfer, wrap } from "comlink";
import { createModule } from "../../utils/ModuleEval";
import { ClassicInit } from "./worker.classic";
import { ModuleInit } from "./worker.module";

// 专用线程的接洽代码

/*  用于字符串化的函数，故而只能是一个比较封闭的形式，代码在主线程执行 */
const WorkerWrapperCode = function (options?: WorkerOptions) {
    /* @ts-ignore */
    const { url, port, initUrl } = info;
    const worker = new Worker(url[options?.type || "classic"], options);

    const api = wrap<{
        init(port: MessagePort, initUrl: string): void;
    }>(worker);

    port.then((port: MessagePort) => {
        api.init(transfer(port, [port]), initUrl);
    });

    worker.addEventListener("error", (e) => {
        console.log(e);
    });
    return worker;
};

// 使用了线上版本的 worker 辅助
/* false 时为 dev 状态 */
const moduleWorkerURL = createModule(
    `(${ModuleInit.toString()})();`,
    "worker.module.js"
);

const classicWorkerURL = createModule(
    `(${ClassicInit.toString()})();`,
    "worker.classic.js"
);

/* 转化代码为一段包含 Worker 生成的 封装代码 */
export const WorkerWrapper = (initUrl: string) => {
    // 删除 worker 参数，保证不会循环
    const url = new URL(initUrl);
    url.searchParams.delete("worker");
    // 这个代码将会在 Compiler 线程执行
    return `
    const info = {
        url:${JSON.stringify({
            classic: classicWorkerURL,
            module: moduleWorkerURL,
        })},
        port: globalThis.__create_compiler_port__(),
        initUrl:"${url.toString()}"
    }
    const wrapper = ${WorkerWrapperCode.toString()}
    export default wrapper
    `;
};
