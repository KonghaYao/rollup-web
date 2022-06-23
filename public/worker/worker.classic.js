// classic worker 线程
importScripts("./something.js");
postMessage(["线程返回", globalThis.data]);
console.warn("classic 线程执行结束", location);
// fetch("./something.js")
//     .then((res) => res.text())
//     .then((res) => {
//         console.log(res);
//     });
