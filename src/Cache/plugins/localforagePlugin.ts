import { createStore } from "../createStore";
import { CachePlugin } from "../Types";

export const localforagePlugin = <T = string>({
    name,
}: {
    name: string;
}): CachePlugin<T> => {
    const store = createStore({
        name,
    });
    const keyStore = new Set();
    return {
        name: "localforage",
        async get(key) {
            return store.getItem(key) as any as Promise<T | void>;
        },
        async set(key, value) {
            return store
                .setItem(key, value)
                .then(() => {
                    return true;
                })
                .catch((e) => {
                    console.error("Cache Set | ", e);
                    return false;
                });
        },
        async has(key) {
            if (keyStore.size === 0)
                await store.keys().then((res) => {
                    res.forEach((i) => keyStore.add(i));
                });
            return keyStore.has(key);
        },
        clear() {
            return store.clear();
        },
    };
};
