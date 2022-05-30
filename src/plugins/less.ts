import { Plugin } from "rollup-web";
import { Setting } from "src/Setting";
import { loadScript } from "../utils/loadScript";
import { useGlobal } from "../utils/useGlobal";
import { wrapPlugin } from "../utils/wrapPlugin";

export const initLess = async (lessUrl?: string) => {
    return loadScript(lessUrl || Setting.NPM("less"), {
        cacheTag: "less",
    }).then(() => globalThis.less);
};
export const _less = ({
    less: lessOptions,
    log,
}: {
    less?: Less.Options;
    log?: (id: string, code: string) => void;
} = {}) => {
    const less = useGlobal<typeof import("less")>("less");
    return {
        name: "less",
        async buildStart() {
            await initLess();
        },
        async transform(input, id) {
            const { css, map, imports } = await less.render(input, {
                ...lessOptions,
                filename: id,
                rootpath: id.replace(/\/[^\/]*?$/, ""),
            });
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
