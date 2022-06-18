import { LocalCache } from "./LocalCache";

export type CachePlugin<T> = {
    name: string;
    /**
     * 如果有一个插件返回值，那么立即返回值 ，
     * 若返回 null, 那么直接结束；
     * 若返回 undefined 那么跳过这个函数
     */
    set(this: LocalCache, key: string, value: T): Promise<boolean | void>;
    /**
     * 如果有一个插件返回值，那么立即返回值 ，
     * 若返回 null, 那么直接结束；
     * 若返回 undefined 那么跳过这个函数
     */
    get(this: LocalCache, key: string): Promise<T | void>;
    /**
     * 如果有一个插件返回值，那么立即返回值 ，
     * 若返回 null, 那么直接结束；
     * 若返回 undefined 那么跳过这个函数
     */
    has(this: LocalCache, key: string): Promise<boolean | void>;
};
export type CacheKey<T = string> = keyof Omit<CachePlugin<T>, "name">;
