declare module "https://*" {
    const a: any;
    export default a;
}
declare module "rollup-web" {
    export * from "rollup";
}

declare module "url-resolve-browser" {
    import { resolve } from "path-browserify";
    export default resolve;
}
declare module "rollup-plugin-multi-input" {
    const a: any;
    export default a;
}
declare module "safe-identifier-bundle" {
    const a: any;
    export default a;
}
declare module "process-bundle" {
    export * from "process";
}
declare module "glob-bundle" {
    export * from "glob";
}
declare module "url-bundle" {
    export * from "url";
}
declare module "zlib-bundle" {
    export * from "zlib";
}
declare module "buffer-bundle" {
    export * from "buffer";
}
declare module "@rollup/pluginutils-bundle" {
    export * from "@rollup/pluginutils";
}
declare module "os-bundle" {
    export * from "os";
}
declare module "nv-browser-brotli" {
    export * from "brotli";
}
