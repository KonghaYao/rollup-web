import { createModule } from "../../utils/ModuleEval";
import type { Evaluator } from "../../Evaluator";
import { Setting } from "../../Setting";
/* module worker 启动函数，必须为同步 */
const ModuleInit = function () {
    addEventListener("message", async (e) => {
        // ! 在内部进行了  Evaluator
        const { port: CompilerPort, localURL } = e.data;
        console.info(
            "%cThread | Data Receive ",
            "background-color:#770000;color:white"
        );
        /* @ts-ignore */
        let Eval = new Evaluator();
        await Eval.useWorker(CompilerPort);
        await Eval.createEnv({
            worker: "module",
            root: localURL,
            wrap: true,
        }).then(async () => {
            await Eval.evaluate(localURL);
            console.info(
                "%cThread | Module Worker ready",
                "background-color:#770000;color:white"
            );
        });
    });
    addEventListener("error", (e) => {
        console.error(e);
    });
};
// console.log(ModuleInit.toString().replace(/^function () {([\s\S]*)}$/g, "$1"));
// 使用了线上版本的 worker 辅助
/* false 时为 dev 状态 */
export const moduleWorkerURL = createModule(
    // 使用这样的方式使得线程同步加载
    `import { Evaluator } from '${Setting.NPM(
        `rollup-web@${Setting.workerVersion}/dist/index.js`
    )}';
    (${ModuleInit.toString()})()`,
    "worker.module.js"
);
