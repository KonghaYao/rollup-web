import type { Compiler } from "./Compiler";
import { fetchHook } from "./Compiler/fetchHook";
import { setGlobal, useGlobal } from "./utils/useGlobal";
import { Setting } from "./Setting";
import { ModuleWorkerInit } from "./Evaluator/systemWorker";
import { createEndpoint, expose, proxy } from "comlink";
import { resolveHook } from "./Compiler/resolveHook";
import { log } from "./utils/ColorConsole";
import { isInWorker } from "./utils/createWorker";

/** 一个单独的 Compiler 执行环境, 专门用于 适配 执行 的环境 */
export class Evaluator {
    Compiler!: Compiler;
    moduleConfig!: Compiler["moduleConfig"];
    root = location.href;
    static registered = false;
    constructor() {
        if (Evaluator.registered)
            throw new Error(
                "This Environment had been already Hold by a Evaluator"
            );
    }

    async createEnv({
        Compiler,
        worker,
        root,
    }: {
        Compiler: Compiler;
        worker?: "module" | "classic";
        root?: string;
    }) {
        this.Compiler = Compiler;

        if (root) this.root = root;
        this.moduleConfig = JSON.parse(await Compiler.getModuleConfig());

        let system = useGlobal<any>("System");

        if (!system || !system.__rollup_web__) {
            log.pink("Evaluator Systemjs | init");
            const systemURL = Setting.NPM("systemjs@6.12.1/dist/system.min.js");
            if (isInWorker()) {
                await useGlobal<any>("importScripts")(systemURL);
            } else {
                await import(systemURL);
            }
            system = useGlobal("System");
            system.__rollup_web__ = true;
            this.HookSystemJS();
        }

        // 在 worker 中需要对 systemjs 初始化进行一些处理
        // worker 表示执行环境在 worker 中
        if (worker) {
            switch (worker) {
                case "module":
                    // module worker, 需要复写 system 的 fetch-loader
                    ModuleWorkerInit();
            }
        }

        // 辅助 worker 进行一个操作
        setGlobal("__create_compiler_port__", () => {
            return this.createCompilerPort();
        });

        return this;
    }
    HookSystemJS() {
        fetchHook(this.Compiler.moduleCache, this.moduleConfig, () =>
            this.Compiler.CompileSingleFile.bind(this.Compiler)
        );
        resolveHook();
    }
    // 创建一个端口给其他的线程使用
    async createCompilerPort(): Promise<MessagePort> {
        // @ts-ignore
        if (this.Compiler[createEndpoint]) {
            // @ts-ignore
            return this.Compiler[createEndpoint]();
        } else {
            console.warn("创建端口");
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
        await this.Compiler.evaluate(
            new URL(path, this.root).toString(),
            proxy(cb)
        );

        return result;
    }
}
