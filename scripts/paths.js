const npmCDN = "https://fastly.jsdelivr.net/npm/";
/*
    统一的 paths 替换项
*/
export const paths = {
    "rollup-web": npmCDN + "rollup/dist/es/rollup.browser.js",
    "@swc/core": npmCDN + "@swc/wasm-web/wasm-web.js",
    "@swc/wasm-web": npmCDN + "@swc/wasm-web/wasm-web.js",
    "process-bundle": npmCDN + "process/browser.js/+esm",
    "magic-string": npmCDN + "magic-string/+esm",
    util: npmCDN + "util/+esm",
    events: npmCDN + "events/+esm",
    "os-bundle": npmCDN + "os/+esm",
    punycode: npmCDN + "punycode/+esm",
    "zlib-bundle": npmCDN + "pako/+esm",
    "nv-browser-brotli": npmCDN + "nv-browser-brotli/+esm",
    "safe-identifier-bundle": npmCDN + "safe-identifier/+esm",
    "lodash-es/merge": npmCDN + "lodash-es/merge.js",

    assert: "https://cdn.skypack.dev/assert",
    "url-bundle": "https://cdn.skypack.dev/url",
    picomatch: "https://cdn.skypack.dev/picomatch",

    "buffer-bundle": "https://esm.sh/buffer",
    "source-map": "https://esm.sh/source-map",

    postcss: "https://esm.sh/postcss",
    "postcss-import": "https://esm.sh/postcss-import",
    "@vue/compiler-sfc": "https://cdn.skypack.dev/@vue/compiler-sfc",
    "@babel/core": "https://esm.sh/@babel/core",
    // uncheck
    "postcss-selector-parser": "https://esm.sh/postcss-selector-parser",

    yaml: "https://esm.sh/yaml",
    "concat-with-sourcemaps": "https://esm.sh/concat-with-sourcemaps",
};
