export const npmCDN = "https://cdn.jsdelivr.net/npm/";
export const ESMCDN = "https://esm.run/";
export const SHCDN = "https://esm.sh/";
export const Skypack = "https://cdn.skypack.dev/";
/*
    统一的 paths 替换项
*/
export const paths = {
    "@swc/core": npmCDN + "@swc/wasm-web/wasm-web.js",
    "@swc/wasm-web": npmCDN + "@swc/wasm-web/wasm-web.js",
    "magic-string": npmCDN + "magic-string/+esm",
    util: npmCDN + "util/+esm",
    events: npmCDN + "events/+esm",
    "os-bundle": npmCDN + "os/+esm",
    punycode: npmCDN + "punycode/+esm",
    "zlib-bundle": npmCDN + "pako/+esm",
    "nv-browser-brotli": npmCDN + "nv-browser-brotli/+esm",
    "safe-identifier-bundle": npmCDN + "safe-identifier/+esm",
    "assemblyscript/dist/asc": npmCDN + "assemblyscript@0.20.8/dist/asc.min.js",
    "@mdx-js/mdx/lib/compile.js": SHCDN + "@mdx-js/mdx/lib/compile.js",
    "@isomorphic-git/lightning-fs": Skypack + "@isomorphic-git/lightning-fs",
    "@mdx-js/mdx": Skypack + "@mdx-js/mdx",
    rehype: Skypack + "rehype",
    "unist-util-visit": Skypack + "unist-util-visit",
    "@konghayao/iframe-box":
        Skypack + "@konghayao/iframe-box@0.0.5/dist/iframe-box.es.js",

    assert: Skypack + "assert",
    "url-bundle": Skypack + "url",
    "@vue/compiler-sfc": Skypack + "@vue/compiler-sfc",

    // "buffer-bundle": "https://esm.sh/buffer",
    "source-map": "https://esm.sh/source-map",

    // 锁版本是为了加速服务器加载
    "postcss-import": "https://esm.sh/postcss-import@14.1.0",
    "@babel/core": "https://esm.sh/@babel/core@7.18.9",
    // uncheck
    "postcss-selector-parser": "https://esm.sh/postcss-selector-parser",

    yaml: "https://esm.sh/yaml",
    "concat-with-sourcemaps": "https://esm.sh/concat-with-sourcemaps",
};
