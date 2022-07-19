import { Plugin } from "rollup";
import { wrapPlugin } from "../utils/wrapPlugin";

export const _css = ({}: {} = {}) => {
    return {
        name: "css",
        transform(css, id) {
            return `
                const style = document.createElement('style')
                style.type="text/css"
                style.innerHTML = \`${css}\`
                document.head.appendChild(style)
           
                `;
        },
    } as Plugin;
};
/* 简单 CSS 插件，没有进行任何的操作  */
export const css = wrapPlugin(_css, {
    extensions: [".css"],
});
