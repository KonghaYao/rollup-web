import { Setting } from "../../Setting";
import { loadScript } from "../../utils/loadScript";
import { useGlobal } from "../../utils/useGlobal";
import { PreprocessLang } from "./splitSFC";

interface PreprocessHelper {
    /* 返回对应的 预处理器 */
    require: () => any;
    load: (url?: string) => Promise<any>;
    config: (filename: string) => any;
}
export const less: PreprocessHelper = {
    require() {
        return useGlobal("less");
    },
    async load(url) {
        return loadScript(url || Setting.NPM("less"), {
            cacheTag: "less",
        });
    },
    config(filename) {
        return {
            filename: filename,
            rootpath: filename.replace(/\/[^\/]*?$/, ""),
        };
    },
};
export default { less } as { [key in PreprocessLang]: PreprocessHelper };
