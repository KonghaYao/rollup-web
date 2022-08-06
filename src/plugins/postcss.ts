import { TransformPluginContext } from "rollup";
import { wrapPlugin } from "../utils/wrapPlugin";
import Postcss, { AcceptedPlugin } from "postcss";
import atImport from "postcss-import";
import importURL from "./postcss/import-url";
import { loadFromRollup } from "./postcss/loadFromRollupCache";
import { URLResolve } from "../utils/isURLString";
import { WebPlugin } from "../types";
import { CompilerModuleConfig } from "../Compiler";
import { isMatch } from "picomatch";

/**
 * postcss 的接口
 * @property filter 返回 true 则过滤掉这个url
 */
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
} = {}): WebPlugin => {
    // Rollup 内置环境
    let Context: TransformPluginContext;
    let Info: { id: string };
    let config!: CompilerModuleConfig;

    const checkFilter = (url: string) => {
        // filter 权限高于一切
        if (filter) {
            if (filter(url)) {
                return true;
            } else {
                return false;
            }
        }
        if (config.ignore && isMatch(url, config.ignore)) {
            // 如果 url 属性被匹配到，则直接被返回
            return true;
        }
    };

    /* Postcss 内置插件 */
    const innerPlugin = [
        // TODO 打包 area 问题,如何链接到
        // TODO 当使用 绝对路径的 css 导入时，会报错，其实本质就是 area 的问题

        /*  atImport 与 Rollup 的交接 */
        atImport({
            resolve(id, basedir, importOptions) {
                const url = URLResolve(id, basedir + "/index.css");
                // 这是为了可以获取标记，区分 url
                return "//" + encodeURIComponent(url);
            },
            async load(url) {
                if (url.startsWith("//"))
                    url = decodeURIComponent(url.slice(2));
                // filter 权限高于一切
                const ignore = checkFilter(url);
                if (ignore) return url;
                await loadFromRollup.call(Context, url, Info);
                return Context.cache.get(url);
            },
        }),
        /**
         * atImport 是处理相对路径的操作
         * importURL 是处理绝对路径的操作
         */
        importURL({
            /* 绝对路径直接忽略就好 */
            async load(url, options) {
                if (url.startsWith("//"))
                    url = decodeURIComponent(url.slice(2));
                const ignore = checkFilter(url);
                if (ignore) return;
                await loadFromRollup.call(Context, url, Info);
                return Context.cache.get(url);
            },
        }),
    ];
    const converter = Postcss(plugins.concat(innerPlugin));
    return {
        name: "postcss",
        ChangeConfig(ModuleConfig) {
            config = ModuleConfig;
        },
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
    };
};
/* Postcss 插件，内置 css 模块解析，如果需要 sass，less 解析，需要使用额外插件，并配置 extensions 属性  */
export const postcss = wrapPlugin(_postcss, {
    extensions: [".css"],
});
