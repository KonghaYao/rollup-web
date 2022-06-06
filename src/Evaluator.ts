import { Compiler } from "./Compiler";
import { fetchHook } from "./Compiler/fetchHook";
import { useGlobal } from "./utils/useGlobal";
import { Setting } from "./Setting";
import { ModuleWorkerInit } from "./Evaluator/systemWorker";
import { proxy } from "comlink";

/** 一个单独的 Compiler 执行环境, 专门用于 适配 执行 的环境 */
export class Evaluator {
    Compiler!: Compiler;
    moduleConfig!: Compiler["moduleConfig"];
    async createEnv({
        Compiler,
        worker,
    }: {
        Compiler: Compiler;
        worker?: "module" | "classic";
    }) {
        this.Compiler = Compiler;
        let system = useGlobal("System");
        if (!system) {
            await import(Setting.NPM("systemjs@6.12.1/dist/system.min.js"));
            system = useGlobal("System");
        }

        this.moduleConfig = JSON.parse(await Compiler.getModuleConfig());
        // 联系 systemjs
        fetchHook(Compiler.moduleCache, this.moduleConfig, () =>
            Compiler.CompileSingleFile.bind(Compiler)
        );

        // 在 worker 中需要对 systemjs 初始化进行一些处理
        console.warn("worker 类型", worker);
        if (worker) {
            switch (worker) {
                case "module":
                    // module worker, 需要复写 system 的 fetch-loader
                    ModuleWorkerInit();
                    console.log("重置 systemjs");
            }
        }
        return this;
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
        await this.Compiler.evaluate(path, proxy(cb));

        return result;
    }
}
