import { Plugin } from "rollup-web";
import { wrapPlugin } from "../utils/wrapPlugin";
import Postcss, { AcceptedPlugin } from "postcss";

export const _postcss = ({
    plugins = [],
    options,
    log,
}: {
    plugins?: AcceptedPlugin[];
    options?: (css: string, id: string) => any;

    log?: (id: string, code: string) => void;
} = {}) => {
    const converter = Postcss(plugins);
    return {
        name: "postcss",
        transform(input, id) {
            const { css } = converter.process(
                input,
                options ? options(input, id) : { from: id, to: id }
            );
            log && log(id, css);
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
