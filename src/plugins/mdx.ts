import { Plugin } from "rollup-web";
import { wrapPlugin } from "../utils/wrapPlugin";
import { compile, CompileOptions } from "@mdx-js/mdx";
import merge from "lodash-es/merge";

export const _mdx = ({
    options,
    log,
}: {
    options?: CompileOptions;
    extensions?: string[];
    log?: (id: string, code: string) => void;
} = {}) => {
    return {
        name: "mdx",
        /** wrapPlugin 提供了 extensions 守护，id 必然是符合的 */
        async transform(code: string, id: string) {
            const file = await compile(
                code,
                merge(options, {
                    useDynamicImport: true,
                    baseUrl: id,
                } as CompileOptions)
            );
            const Code = file.value.toString();
            log && log(id, Code);
            return { code: Code, map: file.map };
        },
    } as Plugin;
};
/* Babel 桥接插件 */
export const mdx = wrapPlugin(_mdx, {
    extensions: [".mdx"],
});
