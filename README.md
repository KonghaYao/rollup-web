# Rollup in Browser!

Simply use rollup to bundle **esm or commonjs or typescript code** in browser!

Like Vite in Nodejs! We want to create a brand new bundle environment in browser!

We have made Rollup and Systemjs in browser, Our plugins create bridges to compile Ts, Tsx, Vue SFC, Babel ... to **vanilla JS** run in browser!

We already create some website bundling just in browser!

# Target

1. Native Function

    - [x] SystemJS module
    - [x] Dynamic Import

2. Plugin Provide
    1. Vanilla JS and TS Part
        - [x] Babel-Core Support
        - [x] Babel-plugins Support
        - [x] SWC Support
    2. Style Part
        - [x] Postcss Support
        - [x] CSS Support
        - [x] Less Support
        - [x] Sass Support
        - [ ] Tailwindcss Support (Partial)
    3. Framework Part
        - [x] Vue SFC Support
        - [x] Solidjs Support
        - [ ] React Support
        - [ ] Svelte Support
    4. Special File Part
        - [x] json Support
        - [x] MDX Support
        - [ ] WASM Support
        - [ ] Web Worker Support
    5. Info
        - [ ] Node Builtins Polyfill

# Get Start

## Normal Bundle

```js
// load System.js before
import "https://fastly.jsdelivr.net/npm/systemjs@6.12.1/dist/system.min.js";
import { Compiler } from "https://fastly.jsdelivr.net/npm/rollup-web@3/dist/index.js";

// We use Rollup to compile Code!
const RollupConfig = {
    plugins: [
        // 1. Rollup Plugins used in Nodejs sometimes throw a error
        // 2. But we have browser version of them! Keep Reading!
    ],
};

const compiler = new Compiler(RollupConfig, {
    // Provide a web root to resolve relative path in your code
    root: "https://localhost:8080/",

    // 1. When we use Nodejs to resolve module, you can ignore the extension of file.
    // 2. But we actually need a extension to fetch remote file.
    // 3. So Compiler will join the origin path with extension in `extensions` each.
    // 4. And try to Download them!
    extensions: [".tsx", ".ts", ".js", ".json", ".css"],

    // If you want to see which file load，it could be helpful.
    log(url) {
        console.log("%c Download ==> " + url, "color:green");
    },
});

// evaluate the code just use url!
await compiler.evaluate("./src/index.tsx");
```

## License

Apache-2.0
