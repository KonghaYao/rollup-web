import { IframeBox } from "@konghayao/iframe-box";
import { Setting } from "./Setting";
import { URLResolve } from "./utils/isURLString";
const template = `<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
    </head>
    <body>
    </body>
</html>`;

/* 这个是直接被 String 放置在 iframe 中的代码，所以不能使用外部的参数 */
const threadInit = async () => {
    // import { Evaluator } from "http://localhost:8888/package/rollup-web/dist/index.js";
    /* @ts-ignore */
    const { Evaluator } = await import(
        "https://fastly.jsdelivr.net/npm/rollup-web@3.7.6/dist/index.js"
    );
    /* @ts-ignore */
    const { wrap } = await import("comlink");
    const Eval = new Evaluator();
    (globalThis as any).__Rollup_Env__ = Eval;
    /* 初始化 Compiler 线程的端口, 需要接收到实体的 port，故而需要进行信息接收 */
    const EvalInit = (e: MessageEvent) => {
        if (e.data && e.data.password === "__rollup_init__" && e.data.port) {
            Eval.createEnv({
                Compiler: wrap(e.data.port),
                worker: "module",
                root: e.data.localURL,
            }).then(() => {
                removeEventListener("message", EvalInit);
                dispatchEvent(new Event("__rollup_init__"));
                console.log("iframe 初始化完成");
            });
        }
    };
    addEventListener("message", EvalInit);
    dispatchEvent(new Event("__rollup_ready__"));
};

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
        const [srcUrl, scripts] = await this.createSrc(src, true);
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
    /* 创建 HTML 地址 */
    async createSrc(baseURL = location.href, remote = false) {
        const { rehype } = await import("rehype");
        const { visit } = await import("unist-util-visit");
        const html = remote
            ? await fetch(baseURL).then((res) => res.text())
            : template;
        let scripts = [] as {
            type: "comment";
            properties: {
                src: string;
                [key: string]: any;
            };
        }[];
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

                        /* @ts-ignore */
                        scripts.push(node);
                        return;
                    }
                    if (typeof src === "string")
                        node.properties!.src = URLResolve(src, baseURL);
                    if (typeof href === "string")
                        node.properties!.href = URLResolve(href, baseURL);
                });
            })
            .process(html);
        console.log(file.value);
        return [
            URL.createObjectURL(
                new File([file.value], "index.html", { type: "text/html" })
            ),
            scripts,
        ] as const;
    }
}
