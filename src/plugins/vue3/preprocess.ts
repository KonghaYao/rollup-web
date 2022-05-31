import { Setting } from "../../Setting";
import { loadScript } from "../../utils/loadScript";
import { useGlobal } from "../../utils/useGlobal";
import { PreprocessLang } from "./splitSFC";
interface PreprocessHelper {
    /* 返回对应的 预处理器 */
    require: () => any;
    innerRequire: () => any;
    load: (url?: string) => Promise<any>;
    config: (filename: string) => any;
}
export const less: PreprocessHelper = {
    require() {
        return useGlobal("less");
    },
    /* 被 vue3 内部引用的假对象 */
    innerRequire() {
        return {
            render(input: string, options, cb) {
                cb(undefined as any, {
                    css: input,
                    map: "",
                    imports: [],
                });
            },
        } as LessStatic;
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
            rewriteUrls: true,
            syncImport: true,
        };
    },
};
export default { less } as { [key in PreprocessLang]: PreprocessHelper };
