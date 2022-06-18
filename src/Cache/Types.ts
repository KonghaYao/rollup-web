import { LocalCache } from "./LocalCache";

export type CachePlugin<T> = {
    name: string;
    /**
     * 如果有一个插件返回值，那么立即返回值 ，
     * 若返回 null, 那么直接结束
     */
    set(this: LocalCache, key: string, value: T): Promise<boolean | null>;
    /**
     * 如果有一个插件返回值，那么立即返回值 ，
     * 若返回 null, 那么直接结束
     */
    get(this: LocalCache, key: string): Promise<T | null>;
    /**
     * 如果有一个插件返回值，那么立即返回值 ，
     * 若返回 null, 那么直接结束
     */
    has(this: LocalCache, key: string): Promise<boolean | null>;
};
export type CacheKey<T = string> = keyof Omit<CachePlugin<T>, "name">;
