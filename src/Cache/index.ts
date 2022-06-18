import { Setting } from "src/Setting";
import { useGlobal } from "src/utils/useGlobal";
import { LocalCache } from "./LocalCache";
import { CachePlugin } from "./Types";

await import(Setting.NPM("localforage/dist/localforage.min.js"));
const createStore = (config: LocalForageOptions) => {
    const localforage = useGlobal<typeof import("localforage")>("localforage");
    return localforage.createInstance({
        ...config,
        driver: [
            localforage.INDEXEDDB,
            localforage.WEBSQL,
            localforage.LOCALSTORAGE,
        ],
    });
};
const localforagePlugin = ({ name }: { name: string }) => {
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
const extensions = new LocalCache("__rollup_extensions__").usePlugins(
    localforagePlugin({ name: "__rollup_extensions__" })
);

export default {
    extensions,
};
