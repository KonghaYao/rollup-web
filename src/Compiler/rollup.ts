import { rollup, RollupOptions } from "rollup-web";
/** 单独使用 rollup 进行打包 */
export const useRollup = async (options: RollupOptions) => {
    return rollup(options).then((res) => {
        if (options.output) {
            const result =
                options.output instanceof Array
                    ? res.generate(options.output[0])
                    : res.generate(options.output);

            // 不需要等待关闭完成
            res.close();
            return result;
        } else {
            throw "rollup output error";
        }
    });
};
