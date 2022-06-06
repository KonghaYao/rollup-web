import { Plugin } from "rollup-web";
import { createLocalModule, createModule } from "src/utils/ModuleEval";
import { wrapPlugin } from "../utils/wrapPlugin";

// TODO 专用线程
// TODO Shared Worker

export const _worker = ({}: {} = {}) => {
    const tag = ["worker", "sharedworker"];
    return {
        name: "worker",
        transform(code, id) {
            const workerType = tag.find((i) => new URL(id).searchParams.has(i));
            if (workerType) {
                switch (workerType) {
                    case "worker":
                        return WorkerWrapper(code);
                    case "sharedworker":
                        return SharedWorkerWrapper(code);
                }
            }
        },
    } as Plugin;
};

export const worker = wrapPlugin(_worker, {
    extensions: [".js"],
});

/*  用于字符串化的函数，故而只能是一个比较封闭的形式 */
const WorkerWrapperCode = function (
    this: { url: { classic: string; module: string } },
    options?: WorkerOptions
) {
    const url = this.url;
    return new Worker(url[options?.type || "classic"], options);
};
const moduleWorker = await createLocalModule(
    "./src/plugins/worker/worker.module.js",
    "worker.module.js"
);

const WorkerWrapper = (code: string) => {
    return `
    export default ${WorkerWrapperCode.toString()}.bind({
        url:${JSON.stringify({
            classic: "",
            module: moduleWorker,
        })}
    })
    `;
};
const SharedWorkerWrapper = (code: string) => {};
