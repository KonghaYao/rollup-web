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
        return URL.createObjectURL(
            new File([file.value], "index.html", { type: "text/html" })
        );
    }

    /* 处理 HTML, 将其转化为顺序执行 */
    private async transformHTML(baseURL: string, html: string) {
        const [{ rehype }, { visit }] = await Promise.all([
            import("rehype"),
            import("unist-util-visit"),
        ]);

        return rehype()
            .use(() => (tree) => {
                const collection: {
                    normal: string[];
                    defer: string[];
                    async: string[];
                } = {
                    normal: [],
                    defer: [],
                    async: [],
                };
                const findTag = (props: any) =>
                    props.async ? "async" : props.defer ? "defer" : "normal";
                // 保留 head 标签，添加脚本
                let head: any;
                visit(tree, ["element"], (node) => {
                    if (node.type !== "element") return;
                    const { tagName, properties = {} } = node;
                    const { src, href } = properties;
                    if (tagName === "head") {
                        head = node;
                        return;
                    }
                    if (tagName === "script") {
                        if (src && !node.properties!.ignore) {
                            collection[findTag(node.properties)].push(
                                URLResolve(src as string, baseURL)
                            );
                        } else if (node.children && node.children.length) {
                            // 将 script 文本 转化为延迟函数
                            node.children = node.children.map((i) => {
                                if (i.type === "text") {
                                    collection[findTag(node.properties)].push(
                                        URL.createObjectURL(
                                            new File([i.value], "index.js", {
                                                type: "text/javascript",
                                            })
                                        )
                                    );
                                }
                                return i;
                            });
                            node.properties!.src = false;
                        }
                        node.properties!.type = "rollup-web/script";
                        return;
                    }

                    // 如果部分 element 也有 地址，那么相对应地替换掉
                    if (typeof src === "string")
                        node.properties!.src = URLResolve(src, baseURL);
                    if (typeof href === "string")
                        node.properties!.href = URLResolve(href, baseURL);
                });
                //头部插入沟通函数
                head.children.unshift(
                    {
                        type: "element",
                        tagName: "script",
                        properties: {
                            // 线程通信注册脚本
                            src: Setting.NPM(
                                "@konghayao/iframe-box@0.0.5/dist/iframeCallback.umd.js"
                            ),
                            ignore: true,
                        },
                    },
                    {
                        type: "element",
                        tagName: "script",
                        properties: {},
                        children: [
                            // 内部脚本顺序执行
                            {
                                type: "text",
                                value: `addEventListener('__rollup_init__',async ()=>{
                                const collection = ${JSON.stringify(
                                    collection
                                )};
                                const evaluate = (url)=> globalThis.__Rollup_Env__.evaluate(url).then(()=>{
                                    if(url.startsWith("blob")){
                                        URL.revokeObjectURL(url);
                                    }
                                });
                                // async 标记
                                collection.async.forEach((i)=>{
                                    return evaluate(i)
                                });
                                // 正常流程
                                await collection.normal.reduce(async (promise,i)=>{
                                    return promise.then(()=>{
                                        return evaluate(i)
                                    })
                                },Promise.resolve());
                                // defer 推迟标记
                                await collection.defer.reduce(async (promise,i)=>{
                                    return promise.then(()=>{
                                        return evaluate(i);
                                    })
                                },Promise.resolve());
                            })`,
                            },
                        ],
                    }
                );
            })
            .process(html);
    }
}
