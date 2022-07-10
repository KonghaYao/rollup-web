import { Plugin } from "rollup-web";
import { wrapPlugin } from "../utils/wrapPlugin";
// TODO 在 worker 中会因为没有 dom 而报错，可能是 cdn 使用 browser 问题
import type { CompileOptions } from "@mdx-js/mdx/lib/compile";

import merge from "lodash-es/merge";
let compile: typeof import("@mdx-js/mdx/lib/compile")["compile"];

const pluginFixed = async () => {
    if (!globalThis.document) {
        // mdx 在 worker 中构造失败，所以使用这种方式进行一个保全
        /* @ts-ignore */
        const { decodeNamedCharacterReference } = await import(
            "https://fastly.jsdelivr.net/npm/decode-named-character-reference@1.0.2/index.js/+esm"
        );
        let info = "";
        const mdxFakeElement = new Proxy(
            {},
            {
                get() {
                    return info;
                },
                set(_, __, data) {
                    info = decodeNamedCharacterReference(data);
                    return true;
                },
            }
        );
        // 在这里让后面的代码可以见到 document，然后立马删除 document 避免影响
        globalThis.document = {
            /* @ts-ignore */
            createElement() {
                return mdxFakeElement;
            },
        };
        return () => {
            /* @ts-ignore */
            globalThis.document = undefined;
        };
    }
};

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
        async buildStart() {
            if (!compile) {
                const func = await pluginFixed();
                const module = await import("@mdx-js/mdx/lib/compile.js");
                func && func();
                compile = module.compile;
            }
        },
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
