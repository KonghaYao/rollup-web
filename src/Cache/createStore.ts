import { Setting } from "src/Setting";
import { useGlobal } from "src/utils/useGlobal";
await import(Setting.NPM("localforage/dist/localforage.min.js"));
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
