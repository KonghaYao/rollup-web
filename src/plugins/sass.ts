import { Plugin } from "rollup-web";
import { useGlobal } from "../utils/useGlobal";
import { Setting } from "../Setting";
import { loadScript } from "../utils/loadScript";
import { wrapPlugin } from "../utils/wrapPlugin";
import { createModule } from "../utils/ModuleEval";

export const initSass = async (sassUrl?: string) => {
    return loadScript(
        sassUrl || Setting.NPM("sass.js/dist/sass.js"),
        {
            cacheTag: "sass",
        },
        async () => {
            const src = Setting.NPM("sass.js/dist/sass.worker.js");
            const code = await fetch(src).then((res) => res.text());
            useGlobal<any>("Sass").setWorkerUrl(createModule(code, src));
        }
    );
};
export const _sass = ({
    sass: sassOptions,
    log,
}: {
    sass?: any;
    log?: (id: string, code: string) => void;
} = {}) => {
    let sass: any;
    return {
        name: "sass",
        async buildStart() {
            await initSass();
            const Sass = useGlobal<any>("Sass");
            sass = new Sass();
        },
        async transform(input, id) {
            const { css, map, stats } = await sass.compile(input, {
                ...sassOptions,
                indentedSyntax: /\.scss/.test(id),
            } as object);
            stats.includedFiles.forEach((i: string) => {
                this.resolve(i, id);
            });
            log && log(id, css);
            return { code: css, map };
        },
    } as Plugin;
};
/* 简单 CSS 插件，没有进行任何的操作  */
export const sass = wrapPlugin(_sass, {
    extensions: [".sass", ".scss"],
});
