import { classicWorkerURL } from "./worker.classic";
import { moduleWorkerURL } from "./worker.module";

// 专用线程的接洽代码

/* ! 用于字符串化的函数，故而只能是一个比较封闭的形式，代码在主线程执行 */
const WorkerWrapperCode = function (options?: WorkerOptions) {
    // 在外部注入了参数
    /* @ts-ignore */
    const { url, port, initUrl } = info;
    const worker = new Worker(
        url[options?.type || "classic"],
        Object.assign({ name: initUrl }, options)
    );
    worker.addEventListener("ready", () => {
        console.warn("0");
    });
    if (options?.type === "module") {
        // FIXME 发送事件过早，未初始化完成,
        // 线程中绝对不能发送初始化信息，这样会扰乱 主线程的信息接收，所以必须主线程直接初始化线程
        // 但是 module worker 又是异步的，没有办法监控
        setTimeout(() => {
            worker.postMessage(
                {
                    port,
                    localURL: initUrl,
                },
                [port]
            );
        }, 300);
    } else {
        worker.postMessage(
            {
                port,
                localURL: initUrl,
            },
            [port]
        );
    }
    return worker;
};

/* 转化代码为一段包含 Worker 生成的 封装代码 */
export const WorkerWrapper = (initUrl: string) => {
    // 删除 worker 参数，保证不会循环
    const url = new URL(initUrl);
    url.searchParams.delete("worker");
    // 这个代码将会在 Compiler 线程执行

    return `
    const port = await globalThis.__create_compiler_port__()
    const info = {
        url:${JSON.stringify({
            classic: classicWorkerURL,
            module: moduleWorkerURL,
        })},
        port,
        initUrl:"${url.toString()}"
    }
    const wrapper = ${WorkerWrapperCode.toString()}
    export default wrapper
    `;
};
