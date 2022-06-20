import { createModule } from "../../utils/ModuleEval";
import type { Evaluator } from "../../Evaluator";
import { Setting } from "../../Setting";
/* module worker 启动函数，必须为同步 */
const ModuleInit = function () {
    addEventListener(
        "message",
        (e) => {
            // ! 在内部进行了  和 Evaluator
            const { port: CompilerPort, localURL } = e.data;
            /* @ts-ignore */
            let Eval = new Evaluator();
            Eval.useWorker(CompilerPort).then(async () => {
                await Eval.createEnv({
                    worker: "module",
                    root: localURL,
                    wrap: true,
                });

                await Eval.evaluate(localURL);
                console.info(
                    "%cThread | Module Worker ready",
                    "background-color:#770000;color:white"
                );
            });
        },
        { once: true }
    );
    console.log("挂载 worker 事件完成");
    addEventListener("error", (e) => {
        console.error(e);
    });
};

// 使用了线上版本的 worker 辅助
/* false 时为 dev 状态 */
export const moduleWorkerURL = createModule(
    // 使用这样的方式使得线程同步加载
    `
     import { Evaluator } from '${Setting.NPM(
         `rollup-web@${Setting.workerVersion}/dist/index.js`
     )}';
    // import { Evaluator } from  'http://localhost:8888/package/rollup-web/dist/index.js';
  
     (${ModuleInit.toString()})()
    `,
    "worker.module.js"
);
