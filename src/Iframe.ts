import { IframeBox } from "@konghayao/iframe-box";
import { Setting } from "./Setting";
import { threadInit } from "./iframe/threadInit";
import { URLResolve } from "./utils/isURLString";
const template = `<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
    </head>
    <body>
    </body>
</html>`;

export class IframeEnv {
    async mount({
        container = document.body,
        src,
        port,
    }: {
        container?: HTMLElement;
        src: string;
        port: MessagePort;
    }) {
        const frame = new IframeBox();
        const srcUrl = await this.createSrc(src, true);
        frame.src = srcUrl;
        frame.sandbox += " allow-same-origin";
        container.appendChild(frame);

        return frame.ready.then(async (api) => {
            await api.runCode(`(${threadInit.toString()})()`);
            // Evaluator 初始化
            frame.frame.contentWindow!.addEventListener(
                "__rollup_ready__",
                () => {
                    frame.frame.contentWindow!.postMessage(
                        {
                            password: "__rollup_init__",
                            localURL: src,
                            port,
                        },
                        "*",
                        [port]
                    );
                },
                { once: true }
            );
        });
    }
    /* 重写 iframe 内部的 HTML */
    async createSrc(baseURL = location.href, remote = false) {
        const { rehype } = await import("rehype");
        const { visit } = await import("unist-util-visit");
        const html = remote
            ? await fetch(baseURL).then((res) => res.text())
            : template;

        const file = await rehype()
            .use(() => (tree) => {
                visit(tree, ["element"], (node) => {
                    if (node.type !== "element") return;
                    const { tagName, properties = {} } = node;
                    const { src, href } = properties;
                    if (tagName === "head") {
                        node.children.unshift({
                            type: "element",
                            tagName: "script",
                            properties: {
                                src: Setting.NPM(
                                    "@konghayao/iframe-box@0.0.5/dist/iframeCallback.umd.js"
                                ),
                                ignore: true,
                            },
                        } as any);
                        return;
                    }
                    if (
                        tagName === "script" &&
                        src &&
                        !node.properties!.ignore
                    ) {
                        node.children = [
                            {
                                type: "text",
                                value: `addEventListener('__rollup_init__',()=>globalThis.__Rollup_Env__.evaluate("${URLResolve(
                                    src as string,
                                    baseURL
                                )}"))`,
                            },
                        ];
                        node.properties!.src = false;
                        return;
                    }
                    if (typeof src === "string")
                        node.properties!.src = URLResolve(src, baseURL);
                    if (typeof href === "string")
                        node.properties!.href = URLResolve(href, baseURL);
                });
            })
            .process(html);
        // console.log(file.value);
        return URL.createObjectURL(
            new File([file.value], "index.html", { type: "text/html" })
        );
    }
}
