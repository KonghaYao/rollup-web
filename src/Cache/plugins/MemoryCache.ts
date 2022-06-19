import { CachePlugin } from "../Types";

export const MemoryCache = () => {
    const store = new Map<string, any>();
    return {
        name: "memory",
        get(key) {
            // ! 这里统一没有找到为 undefined 穿透
            const result = store.get(key) ?? undefined;
            // console.log("from memory", result);
            return result;
        },
        /* 在别的插件获取到时，进行一个更新 */
        afterGet(this, key, value) {
            store.set(key, value);
        },
        async set(key, value) {
            store.set(key, value);
            // ! 注意，这里穿透，让其他插件可以进行统一的持续化
            return;
        },
        async has(key) {
            // ! 注意, 如果自身不存在，则进行一个 穿透
            return store.has(key) || undefined;
        },
        clear(this) {
            return store.clear();
        },
    } as CachePlugin<string>;
};
