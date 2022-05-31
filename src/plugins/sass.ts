import { Plugin } from "rollup-web";
import { useGlobal } from "../utils/useGlobal";
import { wrapPlugin } from "../utils/wrapPlugin";
import { sass as SASS } from "./vue3/preprocess";
export const initSass = SASS.load;
type Done = (result?: { content: string }) => void;
type Callback = (
    request: {
        path?: string;
        current?: string;
        previous?: string;
    },
    done: Done
) => void;
type Result = { text: string };
interface SassStatic {
    new (workerUrl?: string): this;
    importer: (Callback: Callback) => void;
    compile: (code: string, options: any, cb: (result: Result) => void) => void;
}
export const _sass = ({
    sass: sassOptions,
    log,
}: {
    sass?: any;
    log?: (id: string, code: string) => void;
} = {}) => {
    let sass: SassStatic;
    return {
        name: "sass",
        async buildStart() {
            await initSass();
            const Sass = useGlobal<SassStatic>("Sass");

            sass = new Sass();

            // 使用一个回调函数直接获取代码并传递给 sass 处理器
            const cb: Callback = (request, done) => {
                if (request.path) {
                    done();
                } else if (request.current) {
                    fetch(new URL(request.current, request.previous))
                        .then((res) => res.text())
                        .then((content) => {
                            done({ content });
                        });
                } else {
                    done();
                }
            };
            sass.importer(cb);
        },
        async transform(input, id) {
            const result = await new Promise<Result>((resolve) => {
                sass.compile(
                    input,
                    {
                        ...sassOptions,
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
                    (result) => resolve(result)
                );
            });

            if (!result.text) throw new Error("scss compiler Error");
            log && log(id, result.text);
            return { code: result.text };
        },
    } as Plugin;
};
/* 简单 CSS 插件，没有进行任何的操作  */
export const sass = wrapPlugin(_sass, {
    extensions: [".sass", ".scss"],
});
