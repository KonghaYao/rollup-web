import { Plugin } from "rollup-web";
import { wrapPlugin } from "../utils/wrapPlugin";
import { less as LESS } from "./postcss/preprocess";
import { log as Log } from "../utils/ColorConsole";

export const initLess = LESS.load;
export const _less = ({
    less: lessOptions,
    log,
}: {
    less?: Less.Options;
    log?: (id: string, code: string) => void;
} = {}) => {
    return {
        name: "less",
        async buildStart() {
            Log.lime("Loading less.js ...");
            await initLess();
        },
        async transform(input, id) {
            const { css, map, imports } = await globalThis.less.render(input, {
                ...lessOptions,
                filename: id,
                rewriteUrls: true,
                rootpath: id.replace(/\/[^\/]*?$/, "/"),
            } as object);
            imports.forEach((i) => {
                this.resolve(i, id);
            });
            log && log(id, css);
            return { code: css, map };
        },
    } as Plugin;
};
/* 简单 CSS 插件，没有进行任何的操作  */
export const less = wrapPlugin(_less, {
    extensions: [".less"],
});
