// module worker 线程
import * as brotli from "brotli-wasm@1.2.0/pkg.bundler/brotli_wasm.js";
postMessage("From Thread");
console.warn(brotli);
fetch("./something.js")
    .then((res) => res.text())
    .then((res) => {
        console.log(res);
    });
