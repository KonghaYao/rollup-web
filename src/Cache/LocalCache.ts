import { CachePlugin, CacheKey } from "./Types";

export class LocalCache<T = string> {
    constructor(public name: string) {}
    private plugins: CachePlugin<T>[] = [];
    usePlugins(...plugins: CachePlugin<T>[]) {
        this.plugins = plugins;
        this.plugins.map((i) => {});
        return this;
    }
    private async walker<
        Key extends CacheKey<T>,
        Func extends CachePlugin<T>[Key],
        Args extends Parameters<Func>,
        Result extends ReturnType<Func>
    >(key: Key, ...args: Args): Promise<Result | null> {
        for (let plugin of this.plugins) {
            if (typeof plugin[key] !== "function") continue;
            const result = await (plugin[key] as any).apply(this, args);
            if (result !== undefined) {
                if (result === null) break;
                return result;
            }
        }
        return null;
    }
    async set(key: string, value: T) {
        const result = await this.walker("set", key, value);
        return result;
    }
    async get(key: string) {
        const result = await this.walker("get", key);
        // 副作用
        if (result) this.walker("afterGet", key, result);
        return result;
    }
    async has(key: string) {
        const result = await this.walker("has", key);
        return result;
    }
    async clear() {
        await this.walker("clear");
    }
}
