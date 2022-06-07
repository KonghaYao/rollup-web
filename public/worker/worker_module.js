import ModuleWorker from "./worker.module.js?worker";
const worker = new ModuleWorker({
    type: "module",
});
worker.addEventListener("message", (e) => {
    console.warn("返回: ", e.data);
});
