type CB = { resolve: Function; reject: Function };

/* 数据缓冲类，在一段时间内缓冲请求，将所有请求叠加到同一时间点进行执行 */
export class BundleBuffer<T, E> {
    bufferArray: T[] = [];
    cbArray: CB[] = [];
    interval;
    constructor(
        /* 缓冲时间段， */
        public timeTile = 50,
        /* 批量执行函数 */
        public runner: (collection: T[]) => Promise<E[]>
    ) {
        this.interval = setInterval(() => {
            if (this.bufferArray.length) this.run();
        }, timeTile);
    }
    destroy() {
        clearInterval(this.interval);
    }
    timeRecord: { time: number; concurrent: number }[] = [];
    /* 间隔时间执行的主要函数 */
    async run() {
        const buffer = this.bufferArray;
        const cb = this.cbArray;
        this.bufferArray = [];
        this.cbArray = [];
        const start = Date.now();
        const info = await this.runner(buffer);
        const time = Date.now() - start;
        this.timeRecord.push({ time, concurrent: buffer.length });
        cb.forEach((i, index) => {
            i.resolve(info[index]);
        });
    }
    send(data: T): Promise<E> {
        this.bufferArray.push(data);
        const p = new Promise((resolve, reject) => {
            this.cbArray.push({ resolve, reject });
        });
        return p as Promise<E>;
    }
}
