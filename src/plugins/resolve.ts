import "process";
import { builtinModules } from "module";
import type { Plugin } from "rollup";

/** 用于 */
export const nodeNative = ({
    /** 写入配置文件 */
    ignore = [],
    log,
}: {
    ignore?: string[];
    log?: (id: string) => void;
} = {}) => {
    return {
        name: "node-native",
        resolveId(thisFile: string, importer: string) {
            if (
                builtinModules.includes(thisFile) &&
                !ignore.includes(thisFile)
            ) {
                log && log(thisFile);
                return { external: true, id: thisFile };
            }
        },
    } as Plugin;
};
