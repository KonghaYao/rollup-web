import { Plugin, PluginCache, PluginContext } from "rollup-web";
import { wrapPlugin } from "../utils/wrapPlugin";
import Postcss, { AcceptedPlugin } from "postcss";
import atImport from "postcss-import";

export const _postcss = ({
    plugins = [],
    options,
    log,
}: {
    plugins?: AcceptedPlugin[];
    options?: (css: string, id: string) => any;

    log?: (id: string, code: string) => void;
} = {}) => {
    let resolve: any;
    let load: (url: string) => ReturnType<PluginContext["load"]>;
    let cache: PluginCache;
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
                    const { id } = await resolve(p);
                    await load(id);
                    /* 从缓存中读取源文件 */
                    return cache.get(id);
                },
            })
        )
    );
    return {
        name: "postcss",
        async transform(input, id) {
            resolve = (source: string) => this.resolve(source, id);
            load = (id: string) => this.load({ id });
            cache = this.cache;
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
