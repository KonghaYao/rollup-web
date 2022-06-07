import { Plugin } from "rollup-web";
import { Setting } from "../Setting";
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

    port.then((port: MessagePort) => {
        worker.postMessage(
            {
                password: "__rollup_init__",
                port: port,
                localURL: initUrl,
            },
            [port]
        );
    });
    worker.addEventListener(
        "message",
        (e) => {
            console.log(e);
            if (e.data === "__rollup_ready__") {
                worker.postMessage({
                    password: "__rollup_evaluate__",
                    url: initUrl,
                });
            }
        },
        { once: true }
    );
    worker.addEventListener("error", (e) => {
        console.log(e);
    });
    return worker;
};

// 使用了线上版本的 worker 辅助
const isOnline = false;
const moduleWorkerURL = await createLocalModule(
    isOnline
        ? Setting.NPM(
              `/rollup-web@${Setting.workerVersion}/src/plugins/worker/worker.module.js`
          )
        : "/package/rollup-web/src/plugins/worker/worker.module.js",
    "worker.module.js"
);
const classicWorkerURL = await createLocalModule(
    isOnline
        ? Setting.NPM(
              `/rollup-web@${Setting.workerVersion}/src/plugins/worker/worker.classic.js`
          )
        : "/package/rollup-web/src/plugins/worker/worker.classic.js",
    "worker.classic.js"
);
const WorkerWrapper = (initUrl: string) => {
    // 删除 worker 参数，保证不会循环
    const url = new URL(initUrl);
    url.searchParams.delete("worker");
    // 这个代码将会在 主线程执行
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
const SharedWorkerWrapper = (code: string) => {};
