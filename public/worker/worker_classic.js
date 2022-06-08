// classic worker 测试 主线程
import ClassicWorker from "./worker.classic.js?worker";
const worker = new ClassicWorker({
    type: "classic",
});

worker.addEventListener("error", (e) => {
    console.error(e);
});
worker.addEventListener("message", (e) => {
    console.warn(e.data);
});
console.log(" Classic Worker Init");
