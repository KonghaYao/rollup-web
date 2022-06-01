import postcss, {
    AtRule,
    Helpers,
    Transformer,
    Root,
    Processor,
    AcceptedPlugin,
} from "postcss";
import { isURLString, URLResolve } from "../../utils/isURLString";

const defaults = {
    recursive: true,
    resolveUrls: false,
};
const space = postcss.list.space;
const urlRegexp = /url\(["']?.+?['"]?\)/g;

export type ImportURLOptions = {
    resolveUrls?: boolean;
    recursive?: boolean;
    load: (url: string, options: any) => Promise<string | void>;
};

const importURL = (options: ImportURLOptions) => {
    options = Object.assign({}, defaults, options);

    return {
        postcssPlugin: "postcss-import-url",
        async Once(tree: Root | AtRule, _: Helpers, parentRemoteFile: string) {
            parentRemoteFile = parentRemoteFile || tree.source!.input.file!;
            const imports: Promise<void>[] = [];
            tree.walkAtRules("import", (atRule) => {
                const params = space(atRule.params);
                let remoteFile = cleanupRemoteFile(params[0]);
                if (parentRemoteFile) {
                    remoteFile = URLResolve(remoteFile, parentRemoteFile);
                }
                if (!isURLString(remoteFile)) {
                    return;
                }
                const loader = options
                    .load(remoteFile, options)
                    .then(async (code) => {
                        if (!code) return;
                        let newNode: Root | AtRule = postcss.parse(code);
                        const mediaQueries = params.slice(1).join(" ");
                        if (mediaQueries) {
                            const mediaNode = postcss.atRule({
                                name: "media",
                                params: mediaQueries,
                                source: atRule.source,
                            });
                            mediaNode.append(newNode);
                            newNode = mediaNode;
                        } else {
                            newNode.source = atRule.source;
                        }

                        if (options.resolveUrls) {
                            // Convert relative paths to absolute paths
                            newNode = newNode.replaceValues(
                                urlRegexp,
                                { fast: "url(" },
                                (url) => resolveUrls(url, remoteFile)
                            );
                        }

                        const tree = await Promise.resolve(
                            options.recursive
                                ? this.Once(newNode, _, remoteFile)
                                : newNode
                        );
                        atRule.replaceWith(tree);
                    });
                imports.push(loader);
            });
            await Promise.all(imports);
            return tree;
        },
    } as any as AcceptedPlugin;
};
export default importURL;
function cleanupRemoteFile(value: string) {
    if (value.slice(0, 3) === "url") {
        value = value.slice(3);
    }
    // 删除两边的符号
    return value.replace(/^['|"|\(|\)]*(.*?)['|"|\(|\)]*$/, "$1");
}

function resolveUrls(to: string, from: string) {
    return 'url("' + URLResolve(cleanupRemoteFile(to), from).toString + '")';
}
