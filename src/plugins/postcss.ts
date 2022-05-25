import "../shim/require.ts";
import Postcss, { PostCSSPluginConf } from "rollup-plugin-postcss";

export default (options: PostCSSPluginConf = {}) => {
    options.config = false;
    return Postcss(options);
};
