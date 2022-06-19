import { LocalCache } from "./LocalCache";
import { localforagePlugin } from "./plugins/localforagePlugin";
import { MemoryCache } from "./plugins/MemoryCache";
import { OutTimeCheck } from "./plugins/OutTimeCheck";

export const ExtensionsCache = new LocalCache(
    "__rollup_extensions__"
).usePlugins(
    OutTimeCheck({
        name: "__rollup_extensions__",
        maxAge: 60 * 60 * 24,
    }),
    MemoryCache(),
    localforagePlugin({ name: "__rollup_extensions__" })
);
export const createModuleCache = (config: any) =>
    new LocalCache("__rollup_module_cache__").usePlugins(
        OutTimeCheck({
            maxAge: 60 * 60 * 24,
            ...config,
            name: "__rollup_module_cache__",
        }),
        MemoryCache(),
        localforagePlugin({ name: "__rollup_module_cache__" })
    );
