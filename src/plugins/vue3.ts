import {
    parse,
    SFCStyleCompileOptions,
    SFCTemplateCompileOptions,
} from "@vue/compiler-sfc";
import { Plugin } from "rollup";
import { wrapPlugin } from "../utils/wrapPlugin";
import { getScript, getStyle } from "./vue3/splitSFC";
export const checkSuffix = (path: string, suffix: string[]) => {
    return suffix.find((i) => path.endsWith(i));
};
function generateID() {
    return Math.random().toString(36).slice(2, 12);
}
function transformVueSFC(
    source: string,
    filename: string,
    config: VueCompileConfig = {}
) {
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
    const script = getScript(descriptor, id, templateOptions, config.sourceMap);
    let css = getStyle(descriptor, id, filename, config.css);

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

export type VueCompileConfig = {
    css?: SFCStyleCompileOptions;
    sourceMap?: boolean;
};
const tag = {
    script: (id: string, ext = "js") => id + ("." + ext) + "?vue-script",
    css: (id: string, index: number, ext = "css") =>
        id + index.toString() + ("." + ext) + "?vue-style",
};
const vue = ({
    css,
    log,
}: {
    log?: (id: string) => void;
} & VueCompileConfig = {}) => {
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
            } = transformVueSFC(vueCode, id, { css });

            const result = entry(
                tag.script(id, script.lang),
                cssCode && cssCode.length
                    ? cssCode.map((i, index) => {
                          return tag.css(id, index, i.lang);
                      })
                    : undefined
            );
            log && log(id);

            // script 计入缓存
            const scriptCode = `/* ${id} */\n` + script.content;

            this.cache.set(tag.script(id, script.lang), {
                code: scriptCode,
            });
            // css 计入缓存
            if (cssCode && cssCode.length) {
                cssCode.forEach((i, index) => {
                    this.cache.set(tag.css(id, index, i.lang), {
                        code: i.style.code,
                    });
                });
            }
            // 整个代码计入缓存
            this.cache.set(id, result);
            return result;
        },
    } as Plugin;
};
export const vue3 = wrapPlugin(
    vue,
    {
        extensions: [".vue"],
    },
    { load: false }
);
