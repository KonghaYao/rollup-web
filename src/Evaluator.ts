import type { Compiler } from "./Compiler";
import { fetchHook } from "./Compiler/fetchHook";
import { setGlobal, useGlobal } from "./utils/useGlobal";
import { Setting } from "./Setting";
import { ModuleWorkerInit } from "./Evaluator/systemWorker";
import {
    createEndpoint,
    expose,
    proxy,
    Remote,
    releaseProxy,
    wrap,
} from "comlink";
import { resolveHook } from "./Compiler/resolveHook";
import { log } from "./utils/ColorConsole";
import { createWorker, isInWorker } from "./utils/createWorker";
import { URLResolve } from "./utils/isURLString";
import { wrapAll } from "./iframe/wrapper";

/** 一个单独的 Compiler 执行环境, 专门用于 适配 执行 的环境 */
export class Evaluator {
    Compiler!: Compiler | Remote<Compiler>;
    moduleConfig!: Compiler["moduleConfig"];

    /*  在 Worker 和 Iframe 中 location 会错误！ */
    root = globalThis.location.href;
    isWorker = isInWorker();
    static registered = false;
    constructor() {
        if (Evaluator.registered)
            throw new Error(
                "This Environment had been already Hold by a Evaluator"
            );
    }
    destroyed = false;
    /* 销毁执行环境 */
    destroy() {
        /* @ts-ignore */
        if (this.Compiler[releaseProxy]) this.Compiler[releaseProxy]();
        /* @ts-ignore */
        delete this.Compiler;
        this.destroyed = true;
    }

    /* 初始化环境，进行之后才能够自动进行 Compiler */
    async createEnv({
        Compiler,
        worker,
        root = globalThis.location.href,
        wrap = false,
    }: {
        Compiler?: Compiler;

        /**
         * 极端情况下覆盖 worker 选项
         */
        worker?: "module" | "classic";
        root?: string;
        wrap?: boolean;
    } = {}) {
        if (Compiler) this.Compiler = Compiler;
        if (!this.Compiler)
            throw new Error(
                "Evaluator | Compiler must be built first! Like useWorker() or input a Compiler! "
            );
        if (root) this.root = root;

        // 注入全局的地址
        globalThis.__Rollup_baseURL__ = this.root;
        this.moduleConfig = JSON.parse(await this.Compiler.getModuleConfig());

        let system = useGlobal<any>("System");

        if (!system || !system.__rollup_web__) {
            log.pink("Evaluator Systemjs | init");
            await Setting.loadSystemJS();

            system = useGlobal("System");
            system.__rollup_web__ = true;
            this.HookSystemJS();
        }

        // 在 worker 中需要对 systemjs 初始化进行一些处理
        // worker 表示执行环境在 worker 中,默认情况下不需要填写 worker，但是避免错误，可以强制填写
        if (worker) this.isWorker = worker;
        if (this.isWorker) {
            switch (this.isWorker) {
                case "module":
                    // module worker, 需要复写 system 的 fetch-loader
                    ModuleWorkerInit();
            }
        }
        if (wrap) {
            wrapAll(this.root);
        }
        // 辅助 worker 插件进行 worker 与 Compiler 线程沟通
        setGlobal("__create_compiler_port__", () => {
            return this.createCompilerPort();
        });

        return this;
    }
    /* 链接 SystemJS */
    HookSystemJS() {
        // 只是异步地使用 cache 内的函数，所以可以这样子传递 proxy
        fetchHook(this.moduleConfig, () =>
            this.Compiler.CompileSingleFile.bind(this.Compiler)
        );
        resolveHook();
    }
    /*  创建一个端口通向 Compiler 线程的端口给其他的线程使用 */
    async createCompilerPort(): Promise<MessagePort> {
        console.warn("创建端口");
        if ((this.Compiler as Remote<Compiler>)[createEndpoint]) {
            return (this.Compiler as Remote<Compiler>)[createEndpoint]();
        } else {
            const { port1, port2 } = new MessageChannel();
            expose(this.Compiler, port2);
            return port1;
        }
    }
    /* 执行代码 */
    async evaluate<T>(path: string) {
        const System = useGlobal<any>("System");

        // 不需要跨线程进行环境数据传输，所以用一个数组承接即可
        // 需要这样子进行一次初始化
        let result = undefined as any as T;

        const cb = async (url: string) => {
            await System.import(url).then((res: T) => (result = res));
        };
        // 传递 第二回调函数 时不会在 Compiler 进行执行，而是返回给 Evaluator 进行处理
        const url = URLResolve(path, this.root);
        /* @ts-ignore */
        await this.Compiler.evaluate(url, proxy(cb));

        return result;
    }
    /* 在所在环境启动一个 Compiler Worker 或者是使用 worker port */
    async useWorker(
        /* 这个 URL 是相对于你所的网页的 URL，而不是执行的 js 文件 */
        workerUrlOrPort: string | MessagePort
    ) {
        if (typeof workerUrlOrPort === "string") {
            log.lime("Evaluator | Creating Worker");
            const worker = await createWorker(workerUrlOrPort, {
                type: "module",
            });
            this.Compiler = wrap(worker);
        } else {
            log.lime("Evaluator | Link Worker");
            this.Compiler = wrap(workerUrlOrPort);
        }
        return this;
    }
}
