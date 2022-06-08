// module worker 测试 主线程
import ModuleWorker from "./worker.module.js?worker";
console.log(ModuleWorker);
const worker = new ModuleWorker({
    type: "module",
});
worker.addEventListener("message", (e) => {
    console.warn("返回: ", e.data);
});
