import {
    Plugin,
    PluginCache,
    PluginContext,
    TransformPluginContext,
} from "rollup-web";
import { wrapPlugin } from "../utils/wrapPlugin";
import Postcss, { AcceptedPlugin } from "postcss";
import atImport from "postcss-import";
import importURL from "./postcss/import-url";

/* atImport 与 Rollup 的交接 */
const loadFromRollupCache = async function (
    this: TransformPluginContext,
    url: string,
    Info: { id: string }
) {
    const result = await this.resolve(url, Info.id);
    if (!result) return;
    await this.load(result);
    /* 从缓存中读取源文件 */
    return this.cache.get(result.id) as string;
};
export const _postcss = ({
    plugins = [],
    options,
    log,
}: {
    plugins?: AcceptedPlugin[];
    options?: (css: string, id: string) => any;
    log?: (id: string, code: string) => void;
} = {}) => {
    let Context: TransformPluginContext;
    let Info: { id: string };

    const converter = Postcss(
        plugins.concat(
            atImport({
                resolve(id, basedir, importOptions) {
                    const url = new URL(id, basedir + "/index.css").toString();
                    console.warn(url);
                    return "//" + encodeURIComponent(url);
                },
                async load(p) {
                    if (p.startsWith("//")) p = decodeURIComponent(p.slice(2));
                    return loadFromRollupCache.call(
                        Context,
                        p,
                        Info
                    ) as Promise<string>;
                },
            }),

            importURL({
                async load(url, options) {
                    return await loadFromRollupCache.call(Context, url, Info);
                },
            })
        )
    );
    return {
        name: "postcss",
        async transform(input, id) {
            Context = this;
            Info = { id };
            console.log(input);
            const { css } = await converter.process(
                input,
                options ? options(input, id) : { from: id, to: id }
            );
            log && log(id, css);
            this.cache.set(id, css);
            return `
            import styleInject from 'style-inject'
            styleInject(\`${css}\`)
            `;
        },
    } as Plugin;
};
/* 简单 CSS 插件，没有进行任何的操作  */
export const postcss = wrapPlugin(_postcss, {
    extensions: [".css"],
});
