import { createModule } from "../../utils/ModuleEval";
import type { Evaluator } from "../../Evaluator";
import { Setting } from "../../Setting";
/* module worker 启动函数，必须为同步 */
const ModuleInit = () => {
    addEventListener(
        "message",
        async (e) => {
            // ! 在内部进行了 import comlink 和 Evaluator
            const { port: CompilerPort, localURL } = e.data;
            let Eval: Evaluator;

            /* @ts-ignore */
            Eval = new Evaluator();
            await Eval.createEnv({
                /* @ts-ignore */
                Compiler: wrap(CompilerPort) as any,
                worker: "module",
                root: localURL,
                wrap: true,
            }).then(async () => {
                await Eval.evaluate(localURL);
                console.log("worker 初始化完成");
            });
        },
        { once: true }
    );
};

// 使用了线上版本的 worker 辅助
/* false 时为 dev 状态 */
export const moduleWorkerURL = createModule(
    // 使用这样的方式使得线程同步加载
    `import {wrap} from '${Setting.NPM("comlink/dist/esm/comlink.mjs")}';
    import { Evaluator } from '${Setting.NPM(
        `rollup-web@${Setting.workerVersion}/dist/index.js`
    )}';
    (${ModuleInit.toString()})();`,
    "worker.module.js"
);
