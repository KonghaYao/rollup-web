// module worker 测试 主线程
import ModuleWorker from "./worker.module.js?worker";
const worker = new ModuleWorker({
    type: "module",
});
worker.addEventListener("message", (e) => {
    console.warn("model receive: ", e.data);
});
worker.addEventListener("error", (e) => {
    console.error(e);
});

console.log(" Module Worker Init");
