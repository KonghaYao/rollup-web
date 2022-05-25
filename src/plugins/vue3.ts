import { parse, SFCTemplateCompileOptions } from "@vue/compiler-sfc";
import { Plugin } from "rollup-web";
import { checkSuffix, wrapPlugin } from "../utils/wrapPlugin";
import { getScript, getTemplate, getStyle } from "./vue3/splitSFC";

function generateID() {
    return Math.random().toString(36).slice(2, 12);
}
function transformVueSFC(source: string, filename: string, sourceMap = false) {
    const { descriptor, errors } = parse(source, { filename });
    if (errors.length) throw new Error(errors.toString());
    const id = generateID();
    const hasScoped = descriptor.styles.some((e) => e.scoped);
    const scopeId = hasScoped ? `data-v-${id}` : undefined;
    const templateOptions = {
        id,
        source: descriptor.template!.content,
        filename: descriptor.filename,
        scoped: hasScoped,
        slotted: descriptor.slotted,
        isProd: false,
        compilerOptions: {
            scopeId: hasScoped ? scopeId : undefined,
            mode: "module",
        },
    } as SFCTemplateCompileOptions;
    const script = getScript(descriptor, id, templateOptions, sourceMap);
    let css = getStyle(descriptor, id, filename);

    return {
        script: script,
        css,
        entry: (scriptURL: string, cssURL?: string[]) => {
            return `
import script from '${scriptURL}';
${filename ? `script.__file = '${filename}';` : ""}
${scopeId ? `script.__scopeId = '${scopeId}';` : ""}
${cssURL && cssURL.length ? cssURL.map((i) => `import '${i}';`).join("") : ""}
export default script;`;
        },
    };
}
const suffix = ["?vue-script", "?vue-style"];
export const vue = ({
    log,
}: {
    extensions?: string[];
    log?: (id: string) => void;
} = {}) => {
    return {
        name: "vue3",

        resolveId(thisFile) {
            const isGen = checkSuffix(thisFile, suffix);
            return isGen ? thisFile : undefined;
        },
        async load(id) {
            // 直接导出缓存中的文件
            if (this.cache.has(id)) {
                return this.cache.get(id);
            }
            if (!id.endsWith(".vue")) return;

            const vueCode = await fetch(id).then((res) => res.text());
            const {
                script,
                css: cssCode,
                entry,
            } = transformVueSFC(vueCode, id, false);
            const tag = {
                script: (id: string, ext = ".js") =>
                    id +
                    (ext.startsWith(".") ? ext : "." + ext) +
                    "?vue-script",
                css: (id: string, index: number, ext = ".css") =>
                    id +
                    index.toString() +
                    (ext.startsWith(".") ? ext : "." + ext) +
                    "?vue-style",
            };
            const result = entry(
                tag.script(id, script.lang),
                cssCode && cssCode.length
                    ? cssCode.map((i, index) => {
                          return tag.css(id, index);
                      })
                    : undefined
            );
            log && log(id);
            const scriptCode = `/* ${id} */\n` + script.content;
            this.cache.set(tag.script(id, script.lang), {
                code: scriptCode,
            });
            if (cssCode && cssCode.length) {
                cssCode.forEach((i, index) => {
                    this.cache.set(tag.css(id, index), { code: i });
                });
            }
            this.cache.set(id, result);
            return result;
        },
    } as Plugin;
};
export const vue3 = wrapPlugin(vue, {
    extensions: [".vue"],
    _suffix: suffix,
});
