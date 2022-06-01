import { TransformPluginContext } from "rollup-web";

/**
 * atImport 是处理相对路径的操作
 * importURL 是处理绝对路径的操作
 */
/*  atImport 与 Rollup 的交接 */
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
