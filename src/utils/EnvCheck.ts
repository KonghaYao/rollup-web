import { isInWorker } from "./createWorker";
export type EnvTag =
    | "main_module"
    | "main_classic"
    | "worker_module"
    | "worker_classic"
    | "iframe_module"
    | "iframe_classic";
export const EnvCheck = (): EnvTag => {
    const isWorker = isInWorker();
    if (isWorker) {
        return ("worker_" + isInWorker) as "worker_module" | "worker_classic";
    }

    // 判断 iframe 和 main 中的 classic 和 module
    const tag: undefined | Window = (function () {
        /* @ts-ignore */
        return this;
    })();
    const contextTag: "module" | "classic" =
        globalThis.window && tag === globalThis.window ? "classic" : "module";

    if (self !== top) {
        return ("iframe_" + contextTag) as "iframe_module" | "iframe_classic";
    } else {
        return ("main_" + contextTag) as "main_module" | "main_classic";
    }
};
