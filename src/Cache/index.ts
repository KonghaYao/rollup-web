import { LocalCache } from "./LocalCache";
import { localforagePlugin } from "./plugins/localforagePlugin";
import { OutTimeCheck } from "./plugins/OutTimeCheck";

const extensions = new LocalCache("__rollup_extensions__").usePlugins(
    OutTimeCheck({
        name: "__rollup_extensions__",
        maxAge: 60 * 60 * 24,
    }),
    localforagePlugin({ name: "__rollup_extensions__" })
);

export default {
    extensions,
};
