/* 异步创建一个 worker，等候第一个信息返回 */
export const createWorker = (
    url: string | URL,
    options?: WorkerOptions,
    /* 初始化的回执，可以判断 data 的值来决定 resolve or reject。默认为 true */
    initCallback?: (data: any) => boolean
) => {
    return new Promise<Worker>((resolve, reject) => {
        const worker = new Worker(url, options);
        worker.addEventListener("error", reject);
        worker.addEventListener(
            "message",
            (msg) => {
                worker.removeEventListener("error", reject);
                (initCallback ? initCallback(msg.data) : true)
                    ? resolve(worker)
                    : reject(msg);
            },
            { once: true }
        );
    });
};

/* 判断 worker 环境 */
export const isInWorker = (): "classic" | "module" | false => {
    if (
        globalThis.self &&
        typeof (globalThis as any).importScripts === "function"
    ) {
        try {
            (globalThis as any).importScripts();
            return "classic";
        } catch (e) {
            return "module";
        }
    }
    return false;
};
