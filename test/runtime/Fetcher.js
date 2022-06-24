import { Evaluator } from "../../dist/index.js";
import { IframeEnv } from "../../dist/Iframe.js";

const Eval = new Evaluator();
await Eval.useWorker("./test/runtime/worker/compilerWorker-iframe.js");
export const port = await Eval.createCompilerPort();

export const module = new IframeEnv();
