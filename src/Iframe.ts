import { IframeBox } from "@konghayao/iframe-box";
import { Setting } from "./Setting";
import { URLResolve } from "./utils/isURLString";
const html = `<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
    </head>
    <body>
    </body>
    <script src="${Setting.NPM(
        "@konghayao/iframe-box/dist/iframeCallback.umd.js"
    )}"></script>
</html>`;
export class IframeEnv {
    async mount(container = document.body) {
        const frame = new IframeBox();
        frame.src = await this.createSrc();
        container.appendChild(frame);
        return frame.ready
            .then(() => {
                return this.InitEnv();
            })
            .then(() => {
                /* 构建信道链接 */
            });
    }
    InitEnv() {}
    async createSrc(baseURL = location.href) {
        const { rehype } = await import("rehype");
        const { visit } = await import("unist-util-visit");
        const file = await rehype()
            .use(() => (tree) => {
                visit(tree, ["element"], (node: any) => {
                    const {
                        properties: { src, href },
                    } = node;

                    if (typeof src === "string")
                        node.properties.src = URLResolve(src, baseURL);
                    if (typeof href === "string")
                        node.properties.href = URLResolve(href, baseURL);
                });
            })
            .process(html);
        return URL.createObjectURL(
            new File([file.value], "a.html", { type: "text/html" })
        );
    }
}
