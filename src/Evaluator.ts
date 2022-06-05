import { Compiler } from "./Compiler";
import { fetchHook } from "./Compiler/fetchHook";
import { useGlobal } from "./utils/useGlobal";
import { proxy } from "comlink";
import { Setting } from "./Setting";

/** 一个单独的 Compiler 执行环境, 专门用于 适配 执行 的环境 */
export class Evaluator {
    Compiler!: Compiler;
    moduleConfig!: Compiler["moduleConfig"];
    async createEnv({ Compiler }: { Compiler: Compiler }) {
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
        return this;
    }
    /* 执行代码 */
    async evaluate(path: string) {
        const System = useGlobal<any>("System");

        // 不需要跨线程进行环境数据传输，所以用一个数组承接即可
        const resultCollection: any[] = [];
        const cb = async (url: string) => {
            await System.import(url).then((res: any) =>
                resultCollection.push(res)
            );
        };
        console.log(resultCollection);
        await this.Compiler.evaluate(path, proxy(cb));

        return resultCollection[0];
    }
}
