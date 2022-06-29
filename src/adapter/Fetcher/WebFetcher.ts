import { Fetcher } from "../Fetcher";

/* 文件缓存器 */
const fileCache = new Set<string>();
export const WebFetcher = (): Fetcher => {
    return {
        async readFile(path) {
            const res = await fetch(path, { cache: "force-cache" });
            return res.ok ? res.text() : undefined;
        },
        async isExist(url: string) {
            if (fileCache.has(url)) {
                return url;
            } else {
                try {
                    const { ok } = await fetch(url);
                    if (!ok) {
                        return false;
                    }
                    fileCache.add(url);
                    return url;
                } catch (e) {
                    return false;
                }
            }
        },
        async isNew() {
            return false;
        },
    };
};
