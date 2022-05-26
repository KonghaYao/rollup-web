import { Plugin } from "rollup-web";
import { wrapPlugin } from "../utils/wrapPlugin";
import Postcss, { AcceptedPlugin } from "postcss";

export const _postcss = ({
    plugins = [],
    options,
}: {
    plugins?: AcceptedPlugin[];
    options?: (css: string, id: string) => any;
} = {}) => {
    const converter = Postcss(plugins);
    return {
        name: "postcss",
        transform(css, id) {
            const finalCss = converter.process(
                css,
                options ? options(css, id) : { from: id, to: id }
            ).css;
            console.log(finalCss);
            return `
            import styleInject from 'style-inject'
            styleInject(\`${finalCss}\`)
            `;
        },
    } as Plugin;
};
/* 简单 CSS 插件，没有进行任何的操作  */
export const postcss = wrapPlugin(_postcss, {
    extensions: [".css"],
});
