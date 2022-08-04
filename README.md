# Rollup in Browser!

[Documents](https://rollup-web-doc.netlify.app/#/)

[![Rate this package](https://badges.openbase.com/js/rating/rollup-web.svg?token=wXaeU/WNjI4arFZ57urey3yM3dt5S5jEGK5pg7R1Rzo=)](https://openbase.com/js/rollup-web?utm_source=embedded&utm_medium=badge&utm_campaign=rate-badge)

Simply use rollup to bundle **esm or commonjs or typescript code** in browser!

Like Vite in Nodejs! We want to create a brand new bundle environment in browser!

We have made a Compiler System in browser, using plugins to compile Ts, Tsx, Vue SFC, Babel ... to **vanilla JS** run in browser!

We already create some website just bundling in browser!

# Target

1. Native Function

    - [x] SystemJS module
    - [x] Dynamic Import
    - [x] Compiler Worker and Environment Worker
    - [x] Plugin Loader (dynamic import plugin easier)
    - [x] Iframe Sandbox
    - [x] Unified Cache System ( indexedDB now, File System Access later)
    - [x] Fetcher Adapter (anyway you like to load source code)
    - [ ] Config File Loader

2. Plugin Provide
    1. Vanilla JS and TS Part
        - [x] Babel-Core Support
        - [x] Babel-plugins Support ( use esm.sh! )
        - [x] SWC Support ( SWC is huge in package size! /(ㄒ o ㄒ)/~~ )
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
        - [ ] StoryBook Support
    4. Special File Part
        - [ ] HTML Support
        - [x] json Support
        - [x] MDX Support
        - [x] WASM Support ([Vite](https://vitejs.dev/guide/features.html#webassembly) and [ESM Integration](https://github.com/WebAssembly/esm-integration))
        - [x] Dedicated Worker Support
            - [x] classic type worker
            - [x] module type worker (recommend)
        - [ ] Shared Worker
    5. Polyfill
        - [ ] Node Builtins Polyfill

# Get Start

## Normal Bundle

```js
import {
    Compiler,
    Evaluator,
} from "https://fastly.jsdelivr.net/npm/rollup-web@4";

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

// This step will create an Environment to run source code!
const Eval = new Evaluator();
await Eval.createEnv({
    Compiler: compiler,
});

// evaluate the code just use url!
await Eval.evaluate("./public/mdx/index.jsx");
```

## Bug Fixing

-   [x] Vue reactive Image src cause error ( use assets plugin to import! )
-   [x] Postcss System Import

## License

Apache-2.0
