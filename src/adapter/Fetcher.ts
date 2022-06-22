/* Fetcher 是用于 web_module 插件进行替换的抽象 */
export interface Fetcher {
    readFile(path: string): Promise<string | void>;
    /* 如果为 true 则需要返回 path */
    isExist(path: string): Promise<false | string>;
    /* 判断文件是否为新 */
    isNew(path: string, lastTime: number): Promise<boolean>;
}
