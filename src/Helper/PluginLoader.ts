import { Setting } from "../Setting";
import { log } from "../utils/ColorConsole";
// 必须为 内置，这样才能够直接判断并加载
const extraRollupPlugins = [
    {
        name: "plugin-json",
        url: "https://esm.sh/@rollup/plugin-json",
    },
    {
        name: "plugin-alias",
        url: "https://esm.sh/@rollup/plugin-alias",
    },
    {
        name: "plugin-commonjs",
        url: "https://esm.sh/@rollup/plugin-commonjs",
    },
    {
        name: "plugin-replace",
        url: "https://esm.sh/@rollup/plugin-replace",
    },
];
export const PluginLoader = {
    versions: [] as string[],
    pluginList: [] as string[],
    extraRollupPlugins,
    async init() {
        this.versions = await fetch(
            "https://data.jsdelivr.com/v1/package/npm/rollup-web"
        )
            .then((res) => res.json())
            .then((i) => i.versions);
        this.pluginList = await fetch(
            "https://data.jsdelivr.com/v1/package/npm/rollup-web@" +
                this.versions[0]
        )
            .then((res) => res.json())
            .then((res) => {
                console.log(res);
                const dist = res.files.find((i: any) => i.name === "dist")!;
                console.log(dist);
                return dist.files
                    .find((i: any) => i.name === "plugins")!
                    .files.filter((i: any) => i.type === "file")!
                    .map((i: any) => i.name.replace(/\.js$/, ""));
            });
    },
    /** list plugins from CDN */
    list(from?: number, to?: number) {
        let showList = this.pluginList.concat(
            this.extraRollupPlugins.map((i) => i.name)
        );
        if (typeof from === "number" && typeof to === "number") {
            showList = showList.slice(from, to);
        }
        log.green("List Plugin :", showList);
    },
    search(reg: string | RegExp) {
        const regexp = typeof reg === "string" ? new RegExp(reg) : reg;

        log.green(
            "Search Plugin :",
            this.pluginList
                .concat(this.extraRollupPlugins.map((i) => i.name))
                .filter((i) => regexp.test(i))
        );
    },

    /* 自动 import 插件 */
    async load(pluginName: string, version?: string) {
        let pluginURL: string;
        let extra = this.extraRollupPlugins.find((i) => i.name === pluginName);
        if (extra) {
            pluginURL = extra.url;
        } else {
            pluginURL = Setting.NPM(
                "rollup-web" +
                    (version ? "@" + version : "") +
                    `/dist/plugins/${pluginName}.js`
            );
        }
        return import(pluginURL).then((res) => {
            log.green(`Loaded ${pluginName} ${version || ""}`);
            return res;
        });
    },
    loads(...tags: string[]) {
        return Promise.all(tags.map((i) => this.load(i)));
    },
};
