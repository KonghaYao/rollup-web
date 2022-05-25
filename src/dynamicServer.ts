import { Plugin, RollupCache } from "rollup";
import { OutputChunk } from "rollup-web";
import { ModuleEval } from "./ModuleEval";
import { useRollup } from "./rollup";
import { isURLString } from "./utils/isURLString";
import { setGlobal, useGlobal } from "./utils/useGlobal";
setGlobal("__dynamic_server_emitter", {});
export class DynamicServer {
    tag: string;
    cache?: RollupCache;
    static server = useGlobal<{ [key: string]: DynamicServer }>(
        "__dynamic_server_emitter"
    );
    // TODO 未完成循环引入问题
    constructor(
        tag = "_import",
        public root = window.location.href.replace(window.location.hash, "")
    ) {
        const emitter = DynamicServer.server;
        if (emitter[tag]) throw "globalThis." + tag + " 已存在";
        this.tag = tag;
        //! 向全局注入函数
        emitter[tag] = this;
    }
    /** 接收所有的异步 import 并返回数据 */
    async HandleDynamic(importer: string, thisFile: string) {
        let url = thisFile.replace(this.root, "./");
        // 本地位置解析
        const first = thisFile.charAt(0);
        if (!isURLString(thisFile) && (first === "." || first === "/")) {
            const importerWeb = new URL(importer, this.root);
            let resolved = new URL(thisFile, importerWeb);
            url = resolved.toString();
        }
        // 本地地址解析成相对地址
        const result = await this.compiler(url);
        return this.evaluate(result, url);
    }

    RollupPlugins: Plugin[] = [];

    /* runtime 运行时的打包函数，可以被替换 */
    async compiler(url: string) {
        return await useRollup({
            input: url.replace(this.root, ""),
            output: {
                format: "es",
            },
            plugins: this.RollupPlugins,
        }).then((res) => res.output as OutputChunk[]);
    }
    /**
     * runtime 运行时的执行函数，可以被替换
     * @param url 用于给其他插件备用
     *  */

    async evaluate(output: OutputChunk[], url: string) {
        return ModuleEval(output[0].code);
    }

    /* ! 打包前需要先注册使用过的 rollup 的插件，如果 compiler 使用 集成的，那么不需要使用 */
    public registerRollupPlugins(plugins: Plugin[]) {
        this.RollupPlugins = plugins;
        return this;
    }
    /** 创建一个 plugin 使用在 rollup */
    createPlugin(
        options: Partial<Parameters<typeof dynamicServerPlugin>[0]> = {}
    ) {
        return dynamicServerPlugin({ ...options, globalServerTag: this.tag });
    }
}

const _dynamic_server = ({
    /** 转化异步 import 为全局的一个函数，这样就可以形成 server */
    globalServerTag,
    /** 在 load 之前进行 log */
    log,
}: {
    globalServerTag: string;
    log?: (string: string) => void;
}) => {
    if (!(globalServerTag in DynamicServer.server))
        throw "请在使用异步导入时，设置异步导入服务器先！";
    return {
        globalServerTag,
        name: "dynamic_server",
        options(options) {
            options.cache = DynamicServer.server[globalServerTag].cache;
            return options;
        },
        /** 负责转接数据给全局服务器代码 */
        resolveDynamicImport(thisFile, importer) {
            return false;
        },

        /** 替换边界导致使用一个函数导出到全局 server */
        renderDynamicImport(options) {
            // 异步动态载入
            console.log(
                `%c dynamic import | ${globalServerTag} | ` + options.moduleId,
                "color:orange"
            );
            return {
                left:
                    "globalThis.__dynamic_server_emitter." +
                    globalServerTag +
                    `.HandleDynamic('${options.moduleId}',`,
                right: `)`,
            };
        },
    } as Plugin;
};

/** 将相对路径解析到 web 地址的解析器，一般用于打包在线模块。一般不单独使用 */
export const dynamicServerPlugin = _dynamic_server;
