import { Plugin } from "rollup-web";
import { useGlobal } from "../utils/useGlobal";
import { Setting } from "../Setting";
import { loadScript } from "../utils/loadScript";
import { wrapPlugin } from "../utils/wrapPlugin";
import { createModule } from "../utils/ModuleEval";

export const initSass = async (sassUrl?: string) => {
    return loadScript(
        sassUrl || Setting.NPM("sass.js/dist/sass.js"),
        {
            cacheTag: "sass",
        },
        /* 这个代码将只会执行一次 */
        async () => {
            const src = Setting.NPM("sass.js/dist/sass.worker.js");
            const code = await fetch(src).then((res) => res.text());
            return useGlobal<any>("Sass").setWorkerUrl(createModule(code, src));
        }
    );
};

export const _sass = ({
    sass: sassOptions,
    log,
}: {
    sass?: any;
    log?: (id: string, code: string) => void;
} = {}) => {
    let sass: any;
    return {
        name: "sass",
        async buildStart() {
            await initSass();
            const Sass = useGlobal<any>("Sass");

            sass = new Sass();
            console.log(sass);
            // We define the importer funcion to try to load the source files using fetch
            sass.importer((request, done) => {
                if (request.path) {
                    // Sass.js already found a file, we probably want to just load that
                    done();
                } else if (request.current) {
                    console.log(request);

                    fetch(new URL(request.current, request.previous))
                        .then((res) => res.text())
                        .then((content) => {
                            done({ content });
                        });
                } else {
                    // let libsass handle the import
                    done();
                }
            });
        },
        async transform(input, id) {
            const result: any = await new Promise((resolve) => {
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
                    } as object,
                    (result: any) => resolve(result)
                );
            });

            if (!result.text) throw new Error("scss compiler Error");
            result.stats?.includedFiles.forEach((i: string) => {
                this.resolve(i, id);
            });
            log && log(id, result.text);
            return { code: result.text };
        },
    } as Plugin;
};
/* 简单 CSS 插件，没有进行任何的操作  */
export const sass = wrapPlugin(_sass, {
    extensions: [".sass", ".scss"],
});
