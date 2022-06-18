import { createStore } from "../createStore";
import { CachePlugin } from "../Types";

export const localforagePlugin = ({ name }: { name: string }) => {
    const store = createStore({
        name,
    });
    const keyStore = new Set();
    return {
        get(key) {
            return store.getItem(key);
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
    } as CachePlugin<string>;
};
