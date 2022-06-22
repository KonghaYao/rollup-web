import { TransformPluginContext } from "rollup-web";

export const loadFromRollupCache = async function (
    this: TransformPluginContext,
    url: string,
    Info: { id: string }
) {
    // 放置 resolve 错误导致没有响应到
    let result: Awaited<ReturnType<typeof this.resolve>>;
    try {
        result = await this.resolve(url, Info.id);
    } catch (e) {
        result = null;
    }
    if (!result || result.external) return;
    const moduleInfo = await this.load(result);
    return moduleInfo.code as string | void;
};
