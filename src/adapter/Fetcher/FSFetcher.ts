import { Fetcher } from "../Fetcher";
import FS from "@isomorphic-git/lightning-fs";
import { isURLString } from "../../utils/isURLString";
import { WebFetcher } from "./WebFetcher";

const pathConvert = (url: string) => {
    if (isURLString(url) && url.startsWith(globalThis.location.origin)) {
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
            return WebFetcher.readFile(path);
        }
    },
    isExist(path) {
        path = pathConvert(path);
        if (path.startsWith("/")) {
            return fs.promises.stat(path).then(
                (res) => {
                    return res.isFile() ? path : false;
                },
                () => false
            );
        } else {
            return WebFetcher.isExist(path);
        }
    },
    isNew(path) {
        path = pathConvert(path);
        return fs.promises.stat(path).then(
            (res) => {
                // 未完成判断
                return res.mtimeMs;
            },
            () => false
        );
    },
};
