import { rollup, RollupOptions, RollupBuild } from "rollup-web";
import { DynamicServer } from "./dynamicServer";
import { useGlobal } from "./utils/useGlobal";
/** 单独使用 rollup 进行打包 */
export const useRollup = async (options: RollupOptions) => {
    let machine: RollupBuild;
    return rollup(options)
        .then((res) => {
            machine = res;
            const server = options.plugins?.find(
                (i) => i && i.name === "dynamic_server"
            );
            if (server) {
                useGlobal<{ [key: string]: DynamicServer }>(
                    "__dynamic_server_emitter"
                )[(server as any).globalServerTag].cache = res.cache;
            }

            if (options.output) {
                return options.output instanceof Array
                    ? res.generate(options.output[0])
                    : res.generate(options.output);
            } else {
                throw "rollup output 写错了";
            }
        })
        .then((res) => {
            machine.close();
            return res;
        });
};
