import { LocalCache } from "./LocalCache";
import { localforagePlugin } from "./plugins/localforagePlugin";
import { MemoryCache } from "./plugins/MemoryCache";
import { OutTimeCheck } from "./plugins/OutTimeCheck";

export const extensions = new LocalCache("__rollup_extensions__").usePlugins(
    OutTimeCheck({
        name: "__rollup_extensions__",
        maxAge: 60 * 60 * 24,
    }),
    MemoryCache(),
    localforagePlugin({ name: "__rollup_extensions__" })
);
