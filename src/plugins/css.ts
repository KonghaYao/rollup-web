import { Plugin } from "rollup-web";
import { wrapPlugin } from "../utils/wrapPlugin";
import postcss from "postcss";
export const _css = ({}: {} = {}) => {
    return {
        name: "css",
        transform(css, id) {
            if (/\.css/.test(id)) {
                return `
                const style = document.createElement('style')
                style.type="text/css"
                style.innerHTML = \`${css}\`
                document.head.appendChild(style)
           
                `;
            }
        },
        async load(id) {
            if (/\.css$/.test(id)) {
                const text = await fetch(id).then((res) => res.text());
                const css = await postcss().process(text);
                return { code: css };
            }
        },
    } as Plugin;
};
/* Babel 桥接插件 */
export const css = wrapPlugin(_css, {
    extensions: [".css"],
});
