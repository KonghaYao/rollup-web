import { Plugin } from "rollup-web";
import { createLocalModule, createModule } from "../utils/ModuleEval";
import { wrapPlugin } from "../utils/wrapPlugin";

// TODO 专用线程
// TODO Shared Worker

export const _worker = ({}: {} = {}) => {
    const tag = ["worker", "sharedworker"];
    return {
        name: "worker",
        load(id) {
            const workerType = tag.find((i) => new URL(id).searchParams.has(i));
            if (workerType) {
                switch (workerType) {
                    case "worker":
                        return WorkerWrapper(id);
                    // case "sharedworker":
                    //     return SharedWorkerWrapper(code);
                }
            }
        },
    } as Plugin;
};

export const worker = wrapPlugin(_worker, {
    extensions: [".js"],
});

/*  用于字符串化的函数，故而只能是一个比较封闭的形式，代码在主线程执行 */
const WorkerWrapperCode = function (options?: WorkerOptions) {
    /* @ts-ignore */
    const { url, port, initUrl } = info;
    const worker = new Worker(url[options?.type || "classic"], options);
    console.log(port);
    port.then((port: MessagePort) => {
        worker.postMessage(
            {
                password: "__rollup_init__",
                port: port,
            },
            [port]
        );
    });
    worker.addEventListener(
        "message",
        (e) => {
            if (e.data === "init") {
                worker.postMessage({
                    password: "__rollup_evaluate__",
                    url: initUrl,
                });
            }
        },
        { once: true }
    );
    return worker;
};
const moduleWorker = await createLocalModule(
    "http://localhost:8888/package/rollup-web/src/plugins/worker/worker.module.js",
    "worker.module.js"
);

const WorkerWrapper = (initUrl: string) => {
    // 删除 worker 参数，保证不会循环
    const url = new URL(initUrl);
    url.searchParams.delete("worker");
    // 这个代码将会在 主线程执行
    return `
    const info = {
        url:${JSON.stringify({
            classic: "",
            module: moduleWorker,
        })},
        port:globalThis.__create_compiler_port__(),
        initUrl:"${url.toString()}"
    }
    const wrapper = ${WorkerWrapperCode.toString()}
    export default wrapper
    `;
};
const SharedWorkerWrapper = (code: string) => {};
