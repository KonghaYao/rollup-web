import { useGlobal } from "../utils/useGlobal";
import { loadScript } from "../utils/loadScript";
import { isMatch } from "picomatch";

/** 模块缓存类，被打包的代码将不会被更新 */
export class ModuleCache<T extends string, E> extends Map<T, E> {
    set(key: T, value: E): this {
        // 写入缓存不需要进行忽略
        // 这是为了 模块同一性
        if (this.isIgnore(key)) return this;
        if (this.store) {
            this.store.setItem(key.replace(/\?.*/, ""), value).then(() => {
                this.Keys.push(key);
            });
        }
        return super.set.call(this, key, value);
    }
    store!: typeof import("localforage");
    Keys: T[] = [];
    config: CacheConfig = {};
    createConfig(config: CacheConfig) {
        this.config = Object.assign(
            {
                maxAge: 24 * 60 * 60,
            },
            config
        );
    }
    forceUpdate = false;
    async registerCache() {
        await loadScript(
            "https://fastly.jsdelivr.net/npm/localforage/dist/localforage.min.js"
        );
        const localforage = useGlobal<any>("localforage");
        // Feel free to change the drivers order :)
        this.store = localforage.createInstance({
            name: "rollup_web",
            driver: [
                localforage.INDEXEDDB,
                localforage.WEBSQL,
                localforage.LOCALSTORAGE,
            ],
        });
        this.forceUpdate = await this.isOutTime();
    }
    /* 注意，这里的 key 不要携带 searchParams；如果携带，你必须按顺序携带 */
    async hasData(key: T): Promise<false | T> {
        if (this.isIgnore(key)) return false;
        if (this.store) {
            if (this.Keys.length === 0)
                this.Keys = (await this.store.keys()) as T[];
            return (
                this.Keys.find((i) => {
                    // 如果相等，那么前面的部分必然是相等的，但是 后面的 searchParams 却可以是不相等的
                    return i.startsWith(key);
                }) || false
            );
        }
        return super.has.call(this, key) ? key : false;
    }
    async getData(key: T): Promise<E | undefined> {
        if (this.isIgnore(key)) return;
        if (this.store) {
            const data = await this.store.getItem<E>(key);
            if (data) return data;
        }
        return super.get.call(this, key);
    }
    /* 查询缓存是否被忽略 */
    private isIgnore(url: string) {
        if (this.forceUpdate) return true;
        if (this.config.ignore) {
            return isMatch(url, this.config.ignore);
        } else {
            return false;
        }
    }
    /* 不需要每次都进行过期检测，只需要在初始化的时候进行一次就足够了 */
    private async isOutTime() {
        const lastUpdate = await this.store.getItem<number>("__lastUpdateTime");
        const time = lastUpdate!;
        if (typeof time === "number") {
            if (Date.now() - time < this.config.maxAge! * 1000) {
                // 将会使用缓存
                return false;
            }
        }
        this.store.setItem<number>("__lastUpdateTime", Date.now());
        return true;
    }
}
/**
 * 缓存配置项
 */
export type CacheConfig = {
    /*  设置忽略缓存的域 */
    ignore?: string[];
    root?: string;
    /* 以秒计算的缓存生命时间 */
    maxAge?: number;
};
