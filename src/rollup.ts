import { rollup, RollupOptions, RollupBuild } from "rollup-web";
/** 单独使用 rollup 进行打包 */
export const useRollup = async (options: RollupOptions) => {
    let machine: RollupBuild;
    return rollup(options)
        .then((res) => {
            machine = res;

            if (options.output) {
                return options.output instanceof Array
                    ? res.generate(options.output[0])
                    : res.generate(options.output);
            } else {
                throw "rollup output error";
            }
        })
        .then((res) => {
            machine.close();
            return res;
        });
};
