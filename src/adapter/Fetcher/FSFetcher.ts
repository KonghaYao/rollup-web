import { Fetcher } from "./Fetcher";
import FS from "@isomorphic-git/lightning-fs";

export const fs = new FS("_rollup_web_store_");
export const FSFetcher: Fetcher = {
    readFile(path) {
        return fs.promises.readFile(path, {
            encoding: "utf8",
        }) as Promise<string>;
    },
    isExist(path) {
        return fs.promises.stat(path).then(
            (res) => {
                return res.isFile() ? path : false;
            },
            () => false
        );
    },
};
