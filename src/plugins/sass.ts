import { Plugin } from "rollup";
import { useGlobal } from "../utils/useGlobal";
import { checkExtension, wrapPlugin } from "../utils/wrapPlugin";
import { sass as SASS } from "./postcss/preprocess";
export const initSass = SASS.load;
type Done = (result?: Request & Partial<{ content: string }>) => void;
type Request = {
    path?: string;
    current?: string;
    previous?: string;
    options?: boolean;
};
type Callback = (request: Request, done: Done) => void;
type Result = { text: string; formatted?: string };
interface SassStatic {
    new (workerUrl?: string): this;
    importer: (Callback: Callback) => void;
    compile: (code: string, options: any, cb: (result: Result) => void) => void;
    options: (all: any, cb?: () => void) => void;
}
import { log as Log } from "../utils/ColorConsole";
import { URLResolve } from "../utils/isURLString";
export const _sass = ({
    sass: sassOptions,
    log,
    extensions,
}: {
    extensions?: string[];
    sass?: any;
    log?: (id: string, code: string) => void;
} = {}) => {
    let sass: SassStatic;
    return {
        name: "sass",
        async buildStart() {
            Log.lime("Loading Sass.js ...");
            await initSass();
            const Sass = useGlobal<SassStatic>("Sass");
            if (this.cache.has("sass")) {
                sass = this.cache.get("sass");
            } else {
                sass = new Sass();
                this.cache.set("sass", sass);
            }
            sass.options("defaults");

            // 使用一个回调函数直接获取代码并传递给 sass 处理器
            const cb: Callback = (request, done) => {
                if (request.path) {
                    done();
                } else if (request.current && request.previous) {
                    const url = URLResolve(request.current, request.previous);
                    request.path = url;
                    const ext = checkExtension(url, extensions!);
                    // 当后缀名符合时，直接下载并转化
                    if (ext) {
                        fetch(url)
                            .then((res) => res.text())
                            .then((content) => {
                                done(Object.assign(request, { content }));
                            });
                    } else {
                        request.options = true;
                        // 这样是为了保证 @import "" 字符串
                        request.path = `"${request.path}"`;
                        done(request);
                    }
                } else {
                    done();
                }
            };
            sass.importer(cb);
        },
        async transform(input, id) {
            const result = await new Promise<Result>((resolve) => {
                sass.options(
                    {
                        indentedSyntax: !/\.scss/.test(id),
                        // Path to source map file
                        // Enables the source map generating
                        // Used to create sourceMappingUrl
                        sourceMapFile: "file",
                        // Pass-through as sourceRoot property
                        sourceMapRoot: "root",
                        // The input path is used for source map generation.
                        // It can be used to define something with string
                        // compilation or to overload the input file path.
                        // It is set to "stdin" for data contexts
                        // and to the input file on file contexts.
                        inputPath: id,
                        // The output path is used for source map generation.
                        // Libsass will not write to this file, it is just
                        // used to create information in source-maps etc.
                        outputPath: "stdout",
                        // Embed included contents in maps
                        sourceMapContents: true,
                        // Embed sourceMappingUrl as data uri
                        sourceMapEmbed: false,
                        // Disable sourceMappingUrl in css output
                        sourceMapOmitUrl: true,
                    },
                    () =>
                        sass.compile(
                            input,
                            {
                                ...sassOptions,
                            },
                            (result) => resolve(result)
                        )
                );
            });
            if (!result.text) throw new Error(result.formatted);
            log && log(id, result.text);
            return { code: result.text };
        },
    } as Plugin;
};
/* 简单 CSS 插件，没有进行任何的操作  */
export const sass = wrapPlugin(_sass, {
    extensions: [".sass", ".scss"],
});
