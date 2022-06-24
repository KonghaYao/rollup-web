import { Fetcher } from "../Fetcher";
import FS from "@isomorphic-git/lightning-fs";
import { isURLString } from "../../utils/isURLString";

const pathConvert = (url: string) => {
    if (isURLString(url)) {
        return new URL(url).pathname;
    }
    return url;
};
export const fs = new FS("_rollup_web_store_");
export const FSFetcher: Fetcher = {
    readFile(path) {
        path = pathConvert(path);
        if (path.startsWith("/")) {
            return fs.promises.readFile(path, {
                encoding: "utf8",
            }) as Promise<string>;
        } else {
            console.log(path);
            return fetch(path, { cache: "force-cache" }).then((res) =>
                res.text()
            );
        }
    },
    isExist(path) {
        path = pathConvert(path);
        return fs.promises.stat(path).then(
            (res) => {
                return res.isFile() ? path : false;
            },
            () => false
        );
    },
    isNew(path) {
        path = pathConvert(path);
        return fs.promises.stat(path).then(
            (res) => {
                return res.mtimeMs;
            },
            () => false
        );
    },
};
