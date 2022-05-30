import {
    SFCTemplateCompileOptions,
    compileScript,
    compileStyle,
    compileTemplate,
    SFCDescriptor,
    SFCScriptBlock,
} from "@vue/compiler-sfc";
import { VueCompileConfig } from "../vue3";

export type PreprocessLang = "less" | "sass" | "scss" | "styl" | "stylus";
import Preprocess from "./preprocess";
export function getStyle(
    descriptor: SFCDescriptor,
    id: string,
    filename: string,
    config: VueCompileConfig["css"]
) {
    if (descriptor.styles) {
        const styled = descriptor.styles.map((style) => {
            const lang = style.lang as PreprocessLang | undefined;
            return compileStyle({
                id,

                filename,
                source: style.content,
                scoped: style.scoped,
                preprocessLang: lang,

                ...config,
                preprocessOptions: lang
                    ? Object.assign(
                          Preprocess[lang].config(filename),
                          config?.preprocessOptions
                      )
                    : config?.preprocessOptions,
                preprocessCustomRequire(id) {
                    if (config?.preprocessCustomRequire)
                        return config.preprocessCustomRequire(id);
                    if (id in Preprocess) {
                        return Preprocess[id as PreprocessLang].require();
                    }
                    return;
                },
            });
        });
        if (styled.length) {
            return styled.map((s) => s.code);
        }
    }
}
export function getTemplate(
    templateOptions: SFCTemplateCompileOptions,
    sourceMap = false
) {
    const template = compileTemplate({
        ...templateOptions,
    });
    if (template.map) {
        template.map.sources[0] = `${template.map.sources[0]}?template`;
        sourceMap &&
            (template.code += `\n//# sourceMappingURL=data:application/json;base64,${btoa(
                JSON.stringify(template.map)
            )}`);
    }
    return template;
}

const createScript = (
    render: string
) => `import { defineComponent as _defineComponent } from 'vue'
const script = _defineComponent({
    setup(__props, { expose }) {
        expose();
        const __returned__ = {  }
        Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true })
        return __returned__
    }
})
${render}
script.render = render
export default script`;
export function getScript(
    descriptor: SFCDescriptor,
    id: string,
    templateOptions: SFCTemplateCompileOptions,
    sourceMap = false
) {
    // 处理没有 script 标签的的元素
    if (!descriptor.script && !descriptor.scriptSetup) {
        const template = getTemplate(templateOptions, sourceMap);
        descriptor.script = {
            type: "script",
            setup: false,
            content: createScript(template.code),
            lang: "js",
            bindings: {},
            scriptAst: undefined,
            scriptSetupAst: undefined,
        } as SFCScriptBlock;
    }

    const script = compileScript(descriptor, {
        inlineTemplate: true,

        id,
        templateOptions,
        sourceMap,
    });
    if (script.map) {
        script.content = `${script.content}`;
        sourceMap &&
            (script.content += `\n//# sourceMappingURL=data:application/json;base64,${btoa(
                JSON.stringify(script.map)
            )}`);
    }
    return script;
}
