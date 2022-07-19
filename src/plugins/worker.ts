import { Plugin } from "rollup";
import { wrapPlugin } from "../utils/wrapPlugin";
import { WorkerWrapper } from "./worker/WorkerWrapper";

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
