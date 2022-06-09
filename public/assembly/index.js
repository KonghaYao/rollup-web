import * as exports from "./index.ts?assemblyscript";
console.log(exports);
const log = (...args) => console.log(args);

// Randomize the array in WebAssembly and log it again
const result = exports.randomizeArray(new Uint32Array([1, 2, 3, 4]));
log("Randomized values: ", result);

// Compute the array values' sum and log it. This will overflow i32 range.
let total = exports.sumArray(new Uint32Array([1, 2, 3, 4]));
log(`Sum (likely overflown): `, total);
export { result, total };
