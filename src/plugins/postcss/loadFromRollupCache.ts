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
    if (!result || result.external) {
        // 如果 resolve 失败或者是屏蔽，则忽略这个 url
        return;
    } else {
        const moduleInfo = await this.load(result);
        return moduleInfo.code as string | void;
    }
};
