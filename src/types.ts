import { Plugin } from "rollup";
import { CompilerModuleConfig } from "./Compiler";

export interface WebPlugin extends Plugin {
    ChangeConfig?: (ModuleConfig: CompilerModuleConfig) => void;
}
