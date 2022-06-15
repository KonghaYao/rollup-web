import { TransformPluginContext } from "rollup-web";

export const loadFromRollupCache = async function (
    this: TransformPluginContext,
    url: string,
    Info: { id: string }
) {
    const result = await this.resolve(url, Info.id);
    if (!result) return;
    await this.load(result);
    /* 从缓存中读取源文件 */
    return this.cache.get(result.id) as string;
};
