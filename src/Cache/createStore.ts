import { Setting } from "../Setting";
import { useGlobal } from "../utils/useGlobal";
await import(
    /** @vite-ignore */
    Setting.NPM("localforage/dist/localforage.min.js")
);
export const createStore = (config: LocalForageOptions) => {
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
