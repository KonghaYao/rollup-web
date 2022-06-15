import { Plugin, TransformPluginContext } from "rollup-web";
import { wrapPlugin } from "../utils/wrapPlugin";
import Postcss, { AcceptedPlugin } from "postcss";
import atImport from "postcss-import";
import importURL from "./postcss/import-url";
import { loadFromRollupCache } from "./postcss/loadFromRollupCache";
import { URLResolve } from "../utils/isURLString";

export const _postcss = ({
    plugins = [],
    options,
    log,
    filter,
}: {
    plugins?: AcceptedPlugin[];
    options?: (css: string, id: string) => any;
    log?: (id: string, code: string) => void;
    filter?: (url: string) => boolean;
} = {}) => {
    // Rollup 内置环境
    let Context: TransformPluginContext;
    let Info: { id: string };

    /* Postcss 内置插件 */
    const innerPlugin = [
        // TODO 打包 area 问题,如何链接到

        /*  atImport 与 Rollup 的交接 */
        atImport({
            resolve(id, basedir, importOptions) {
                const url = URLResolve(id, basedir + "/index.css");
                return "//" + encodeURIComponent(url);
            },
            load(p) {
                if (p.startsWith("//")) p = decodeURIComponent(p.slice(2));
                if (filter && filter(p)) return p;
                return loadFromRollupCache.call(
                    Context,
                    p,
                    Info
                ) as Promise<string>;
            },
        }),
        /**
         * atImport 是处理相对路径的操作
         * importURL 是处理绝对路径的操作
         */
        importURL({
            /* 绝对路径直接忽略就好 */
            async load(url, options) {
                if (filter && filter(url)) return;
                return await loadFromRollupCache.call(Context, url, Info);
            },
        }),
    ];
    const converter = Postcss(plugins.concat(innerPlugin));
    return {
        name: "postcss",
        /* Postcss 最终将会被写为 CSS-In-JS 的形式 */
        async transform(input, id) {
            Context = this;
            Info = { id };
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
/* Postcss 插件，内置 css 模块解析，如果需要 sass，less 解析，需要使用额外插件，并配置 extensions 属性  */
export const postcss = wrapPlugin(_postcss, {
    extensions: [".css"],
});
