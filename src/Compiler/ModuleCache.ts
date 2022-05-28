import { useGlobal } from "../utils/useGlobal";
import { loadScript } from "../utils/loadScript";
import { isMatch } from "picomatch";

/** 模块缓存类，被打包的代码将不会被更新 */
export class ModuleCache<T extends string, E> extends Map<T, E> {
    set(key: T, value: E): this {
        // 写入缓存不需要进行忽略
        // if (this.isIgnore(key)) return this;
        if (this.store) {
            this.store.setItem(key, value).then(() => {
                this.Keys.push(key);
            });
        }
        return super.set.call(this, key, value);
    }
    store!: any;
    Keys: T[] = [];
    config: CacheConfig = {};
    createConfig(config: CacheConfig) {
        this.config = config;
    }
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
    }
    async hasData(key: T): Promise<boolean> {
        if (this.isIgnore(key)) return false;
        if (this.store) {
            if (this.Keys.length === 0) this.Keys = await this.store.keys();
            return this.Keys.includes(key);
        }
        return super.has.call(this, key);
    }
    async getData(key: T): Promise<E | undefined> {
        if (this.isIgnore(key)) return;
        if (this.store) {
            const data = await this.store.getItem(key);
            if (data) return data;
        }
        return super.get.call(this, key);
    }
    /* 查询缓存是否被忽略 */
    isIgnore(url: string) {
        if (this.config.ignore) {
            return isMatch(url, this.config.ignore);
        } else {
            return false;
        }
    }
}
export type CacheConfig = {
    // 设置忽略缓存的文件
    ignore?: string[];
};
