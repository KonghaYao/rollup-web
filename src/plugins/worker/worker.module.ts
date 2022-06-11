import { expose, proxy } from "comlink";
import type { Evaluator } from "../../Evaluator";

// 这里引用了 CDN 进行加载
export const ModuleInit = async () => {
    const { wrap } = await import("comlink");
    /* @ts-ignore */
    const { Evaluator } = await import(
        "https://fastly.jsdelivr.net/npm/rollup-web@3.7.6/dist/index.js"
    );
    let port: MessagePort;
    addEventListener(
        "message",
        (e) => {
            port = e.data;
            let Eval: Evaluator;
            expose(
                {
                    async init(CompilerPort: MessagePort, localURL: string) {
                        Eval = new Evaluator();
                        await Eval.createEnv({
                            Compiler: wrap(CompilerPort) as any,
                            worker: "module",
                            root: localURL,
                        }).then(() => {
                            this.evaluate(localURL);
                        });
                    },
                    evaluate(url: string) {
                        return proxy(Eval.evaluate(url));
                    },
                },
                port
            );
        },
        { once: true }
    );
};
