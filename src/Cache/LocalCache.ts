import { Setting } from "src/Setting";
import { useGlobal } from "src/utils/useGlobal";

await import(Setting.NPM("localforage/dist/localforage.min.js"));
const localforage = useGlobal<typeof import("localforage")>("localforage");

type CachePlugin<T> = {
    name: string;
    /**
     * 如果有一个插件返回值，那么立即返回值 ，
     * 若返回 null, 那么直接结束
     */
    set(key: string, value: T): Promise<boolean | null>;
    /**
     * 如果有一个插件返回值，那么立即返回值 ，
     * 若返回 null, 那么直接结束
     */
    get(key: string): Promise<T | null>;
    /**
     * 如果有一个插件返回值，那么立即返回值 ，
     * 若返回 null, 那么直接结束
     */
    has(key: string): Promise<boolean | null>;
};

type CacheKey<T = string> = keyof Omit<CachePlugin<T>, "name">;
export class LocalCache<T = string> {
    private store: LocalForage;
    private memory = new Map<string, T>();
    constructor(name: string) {
        this.store = localforage.createInstance({
            name,
            driver: [
                localforage.INDEXEDDB,
                localforage.WEBSQL,
                localforage.LOCALSTORAGE,
            ],
        });
    }
    private plugins: CachePlugin<T>[] = [];
    usePlugins(...plugins: CachePlugin<T>[]) {
        this.plugins = plugins;
        return this;
    }
    private async walker<
        Key extends CacheKey<T>,
        Func extends CachePlugin<T>[Key],
        Args extends Parameters<Func>,
        Result extends ReturnType<Func>
    >(key: Key, ...args: Args): Promise<Result | void> {
        for (let plugin of this.plugins) {
            const result = await (plugin[key] as any)(...args);
            if (result !== undefined) {
                if (result === null) break;
                return result;
            }
        }
    }
    async set(key: string, value: T) {
        const result = await this.walker("set", key, value);
        return result;
    }
    async get(key: string) {
        const result = await this.walker("get", key);
        return result;
    }
    async has(key: string) {
        const result = await this.walker("has", key);
        return result;
    }
}

export default {
    extensions: new LocalCache("__rollup_extensions__").usePlugins(),
};
