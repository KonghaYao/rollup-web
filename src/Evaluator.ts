import { Compiler } from "./Compiler";
import { fetchHook } from "./Compiler/fetchHook";
import { useGlobal } from "./utils/useGlobal";
import { proxy } from "comlink";
/** 一个单独的 Compiler 执行环境 */
export class Evaluator {
    Compiler!: Compiler;
    moduleConfig!: Compiler["moduleConfig"];
    async createEnv({ Compiler }: { Compiler: Compiler }) {
        this.Compiler = Compiler;
        let system = useGlobal("System");
        if (!system) {
            await import(
                "https://fastly.jsdelivr.net/npm/systemjs@6.12.1/dist/system.min.js"
            );
            system = useGlobal("System");
        }

        this.moduleConfig = JSON.parse(await Compiler.getModuleConfig());
        // 联系 systemjs
        fetchHook(Compiler.moduleCache, this.moduleConfig, () =>
            Compiler.CompileSingleFile.bind(Compiler)
        );
        return this;
    }
    /* 执行代码 */
    async evaluate(path: string) {
        const System = useGlobal<any>("System");
        let result = await this.Compiler.evaluate(
            path,
            proxy(async (url: string) => {
                result = await System.import(url);
            })
        );
        return result;
    }
}
