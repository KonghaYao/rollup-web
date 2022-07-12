type CB = { resolve: Function; reject: Function };
export class BundleBuffer<T> {
    bufferArray: T[] = [];
    cbArray: CB[] = [];
    constructor(
        /* 缓冲时间段， */
        public timeTile = 50,
        /* 缓冲时间段， */
        public runner: <E>(collection: T[]) => Promise<E[]>
    ) {
        setInterval(() => {
            this.run();
        }, timeTile);
    }
    /* 间隔时间执行的主要函数 */
    async run() {
        const buffer = this.bufferArray;
        const info = await this.runner(buffer);
        this.cbArray.forEach((i, index) => {
            i.resolve(info[index]);
        });
        this.bufferArray = [];
    }
    send(data: T) {
        this.bufferArray.push(data);
        const p = new Promise((resolve, reject) => {
            this.cbArray.push({ resolve, reject });
        });
        return p;
    }
}
