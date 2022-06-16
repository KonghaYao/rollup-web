import { IframeBox } from "@konghayao/iframe-box";
import { Setting } from "./Setting";
import { threadInit } from "./iframe/threadInit";
import { URLResolve } from "./utils/isURLString";
import { wrapper } from "./iframe/wrapper";

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
        const box = new IframeBox();
        box.src = await this.createSrc(src);
        box.sandbox += " allow-same-origin";
        container.appendChild(box);

        return box.ready.then(async (api) => {
            await api.runCode(`${wrapper(src)}
            (${threadInit.toString()})();`);
            // Evaluator 初始化
            box.frame.contentWindow!.addEventListener(
                "__rollup_ready__",
                () => {
                    box.frame.contentWindow!.postMessage(
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
    /**
     * 重写 iframe 内部的 HTML,并将其转化为 blob URL
     * @param baseURL html 的位置，相对于 location
     */
    async createSrc(baseURL: string) {
        const html = await fetch(baseURL).then((res) => res.text());

        const file = await this.transformHTML(baseURL, html);
        // console.log(file.value);
        return URL.createObjectURL(
            new File([file.value], "index.html", { type: "text/html" })
        );
    }

    /* 处理 HTML, 将其转化为顺序执行 */
    private async transformHTML(baseURL: string, html: string) {
        const { rehype } = await import("rehype");
        const { visit } = await import("unist-util-visit");
        return rehype()
            .use(() => (tree) => {
                visit(tree, ["element"], (node) => {
                    if (node.type !== "element") return;
                    const { tagName, properties = {} } = node;
                    const { src, href } = properties;
                    if (tagName === "head") {
                        //头部插入沟通函数
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
                    if (tagName === "script") {
                        if (src && !node.properties!.ignore) {
                            // 将 具有 src 地址的 script 转化为延迟函数
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
                        if (node.children && node.children.length) {
                            // 将 script 文本 转化为延迟函数
                            node.children = node.children.map((i) => {
                                if (i.type === "text") {
                                    i.value = `addEventListener('__rollup_init__',()=>{
                                        const script = document.createElement('script')
                                        script.textContent=\`${i.value}\`;
                                        document.head.appendChild(script)
                                        })`;
                                }
                                return i;
                            });
                            node.properties!.src = false;
                            return;
                        }
                    }

                    // 如果部分 element 也有 地址，那么相对应地替换掉
                    if (typeof src === "string")
                        node.properties!.src = URLResolve(src, baseURL);
                    if (typeof href === "string")
                        node.properties!.href = URLResolve(href, baseURL);
                });
            })
            .process(html);
    }
}
