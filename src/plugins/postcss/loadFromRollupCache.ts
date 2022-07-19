import { TransformPluginContext } from "rollup";

/* 将url 经过 rollup 打包，一般这样会打包出来可执行文件，但是可以从 cache 中获取历史文件来获取特定打包文件 */
export const loadFromRollup = async function (
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
    // ! external 属性无效了
    if (!result) {
        // 如果 resolve 失败或者是屏蔽，则忽略这个 url
        return;
    } else {
        await this.load(result);
        return true;
    }
};
