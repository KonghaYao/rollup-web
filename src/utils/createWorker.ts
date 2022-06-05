export const createWorker = (
    url: string | URL,
    options?: WorkerOptions,
    /* 初始化的回执，可以判断 data 的值来决定 resolve or reject。默认为 true */
    initCallback?: (data: any) => boolean
) => {
    return new Promise((resolve, reject) => {
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
