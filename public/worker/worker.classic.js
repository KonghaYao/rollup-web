// classic worker 线程
importScripts("./something.js");
postMessage(["线程返回", globalThis.data]);
