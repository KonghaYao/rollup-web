// classic worker 线程
importScripts("./something.js");
postMessage(["线程返回", globalThis.data]);

// 注意，你可以在这里访问到 System， 但是 globalThis 却没有 System!
console.warn("classic 线程执行结束", location);
// fetch("./something.js")
//     .then((res) => res.text())
//     .then((res) => {
//         console.log(res);
//     });
