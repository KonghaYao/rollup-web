import type { Compiler } from "./Compiler";
import { fetchHook } from "./Compiler/fetchHook";
import { setGlobal, useGlobal } from "./utils/useGlobal";
import { Setting } from "./Setting";
import { ModuleWorkerInit } from "./Evaluator/systemWorker";
import { createEndpoint, expose, proxy } from "comlink";

/** 一个单独的 Compiler 执行环境, 专门用于 适配 执行 的环境 */
export class Evaluator {
    Compiler!: Compiler;
    moduleConfig!: Compiler["moduleConfig"];
    root = location.href;
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
        let system = useGlobal("System");
        if (!system) {
            await import(Setting.NPM("systemjs@6.12.1/dist/system.min.js"));
            system = useGlobal("System");
        }
        if (root) this.root = root;
        this.moduleConfig = JSON.parse(await Compiler.getModuleConfig());
        // 联系 systemjs
        fetchHook(Compiler.moduleCache, this.moduleConfig, () =>
            Compiler.CompileSingleFile.bind(Compiler)
        );

        // 在 worker 中需要对 systemjs 初始化进行一些处理
        // worker 表示执行环境在 worker 中
        if (worker) {
            switch (worker) {
                case "module":
                    // module worker, 需要复写 system 的 fetch-loader
                    ModuleWorkerInit();
            }
        }
        setGlobal("__create_compiler_port__", () => {
            return this.createCompilerPort();
        });

        return this;
    }
    // 创建一个端口给其他的线程使用
    createCompilerPort() {
        // @ts-ignore
        if (this.Compiler[createEndpoint]) {
            // @ts-ignore
            return this.Compiler[createEndpoint]();
        } else {
            // TODO 本地创建一个 port 未 test

            const channel = new MessageChannel();
            return expose(this.Compiler, channel.port1);
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
