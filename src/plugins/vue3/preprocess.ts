import { createModule } from "../../utils/ModuleEval";
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
        }).then(() => globalThis.less);
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

export const sass: PreprocessHelper = {
    require() {
        return useGlobal("Sass");
    },
    /* 被 vue3 内部引用的假对象 */
    innerRequire() {
        return {
            renderSync(options: { data: string }) {
                return {
                    css: options.data,
                    map: "",
                    stats: { includedFiles: [] },
                };
            },
        };
    },
    async load(url) {
        return loadScript(
            url || Setting.NPM("sass.js/dist/sass.js"),
            {
                cacheTag: "sass",
            },
            /* 这个代码将只会执行一次 */
            async () => {
                const src = Setting.NPM("sass.js/dist/sass.worker.js");
                const code = await fetch(src).then((res) => res.text());
                return useGlobal<any>("Sass").setWorkerUrl(
                    createModule(code, src)
                );
            }
        );
    },
    config(filename) {
        return {};
    },
};
export default { less, sass, scss: sass } as {
    [key in PreprocessLang]: PreprocessHelper;
};
