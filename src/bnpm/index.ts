import { join } from "path";
import createConsole from "./console";

interface ModuleCache {
    entry: string;
    declaration?: string | null;
}
const createModuleCache = () => {
    return new Map<string, ModuleCache>();
};
export class bnpm {
    /** 管理声明 */
    static console = createConsole();
    /** 远程仓库地址 */
    static $registry = "https://esm.sh/";
    /** 管理依赖缓存 */
    static $module = createModuleCache();
    /** 设置为 true 时，进行 .d.ts 自动获取 */
    static $typescript = true;

    /** 安装依赖 */
    static async $install(name: string, version: string = "lastest") {
        const key = `${name}${version ? "@" + version : ""}`;
        const url = join(this.$registry, key);
        return fetch(url)
            .then((res) => {
                if (res.ok) {
                    this.console.log("加载成功 " + key);
                    this.$module.set(key, {
                        entry: url,
                        declaration: res.headers.get("X-TypeScript-Types"),
                    });
                } else {
                    this.console.error("加载失败，包不存在的样子 " + url);
                }
            })
            .catch((e) => {
                this.console.error("加载失败，包不存在的样子 " + url);
                console.error(e);
            });
    }
    static $setModule(key: string, module: ModuleCache) {
        this.$module.set(key, module);
    }
}
