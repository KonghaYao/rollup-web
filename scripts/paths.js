export const npmCDN = "https://fastly.jsdelivr.net/npm/";
export const Skypack = "https://cdn.skypack.dev/";
/*
    统一的 paths 替换项
*/
export const paths = {
    "rollup-remote-cdn": npmCDN + "rollup/dist/es/rollup.browser.js",
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
    comlink: npmCDN + "comlink/dist/esm/comlink.mjs",
    "assemblyscript/dist/asc": npmCDN + "assemblyscript@0.20.8/dist/asc.min.js",

    "@isomorphic-git/lightning-fs": Skypack + "@isomorphic-git/lightning-fs",
    "@mdx-js/mdx": Skypack + "@mdx-js/mdx",
    rehype: Skypack + "rehype",
    "unist-util-visit": Skypack + "unist-util-visit",
    "@konghayao/iframe-box":
        Skypack + "@konghayao/iframe-box@0.0.5/dist/iframe-box.es.js",

    assert: Skypack + "assert",
    "url-bundle": Skypack + "url",
    picomatch: Skypack + "picomatch",

    "buffer-bundle": "https://esm.sh/buffer",
    "source-map": "https://esm.sh/source-map",

    postcss: "https://esm.sh/postcss",
    "postcss-import": "https://esm.sh/postcss-import",
    "@vue/compiler-sfc": Skypack + "@vue/compiler-sfc",
    "@babel/core": "https://esm.sh/@babel/core",
    // uncheck
    "postcss-selector-parser": "https://esm.sh/postcss-selector-parser",

    yaml: "https://esm.sh/yaml",
    "concat-with-sourcemaps": "https://esm.sh/concat-with-sourcemaps",
};
