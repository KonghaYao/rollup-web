export interface Fetcher {
    readFile(path: string): Promise<string | void>;
    /* 如果为 true 则需要返回 path */
    isExist(path: string): Promise<false | string>;
}
export {};
