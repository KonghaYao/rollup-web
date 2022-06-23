import { LocalCache } from "../../Cache/LocalCache";
import { localforagePlugin } from "../../Cache/plugins/localforagePlugin";
import { MemoryCache } from "../../Cache/plugins/MemoryCache";
import { ModuleMapper } from "./module-mapper";

export const cache = new LocalCache<ModuleMapper>(
    "__draw_dependence__"
).usePlugins(
    MemoryCache<ModuleMapper>(),
    localforagePlugin({ name: "__draw_dependence__" })
);
