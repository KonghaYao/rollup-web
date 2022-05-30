# Rollup in Browser!

Simply use rollup to bundle esm or commonjs or typescript code in browser! We have a easy way to do that!

Like Vite in Nodejs! We want to create a brand new bundle environment in browser!

We have Rollup and Systemjs in browser and already create some website bundling in browser!

Our plugins create bridge to use Ts, Tsx, Vue SFC, Babel ... in Our Project , just like in Nodejs!

# Target

-   [x] Dynamic Import
-   [x] Babel Support
-   [x] Vue SFC Support (partial)
-   [x] Solidjs Support
-   [x] Typescript Support
-   [x] CSS Support
-   [x] json Support
-   [x] Less Support

-   [ ] SWC Support
-   [ ] WASM Support
-   [ ] Web Worker Support

# Get Start

## Normal Bundle

```js
// load Systemjs before
import "https://fastly.jsdelivr.net/npm/systemjs@6.12.1/dist/system.min.js";
import { Compiler } from "https://fastly.jsdelivr.net/npm/rollup-web@3/dist/index.js";

// We use Rollup to compile Code!
const RollupConfig = {
    plugins: [
        // Rollup Plugins used in Nodejs sometimes throw a error, So we have browser version of them! Keep Reading!
    ],
};

const compiler = new Compiler(RollupConfig, {
    // Provide a web root to resolve relative path in your code
    root: "https://localhost:8080/",

    // when we use Nodejs to resolve code, you can ignore the extension. But we actually need a extension to fetch the code. So Compiler will join the origin path with extension in `extensions`.
    extensions: [".tsx", ".ts", ".js", ".json", ".css"],

    // if you want to see which file load，it could be helpful.
    log(url) {
        console.log("%c Download ==> " + url, "color:green");
    },

    // When we download the code, and the url match the bundleArea, rollup will bundle it
    bundleArea: ["https://localhost:8080/**"],
});

// evaluate the code just use url!
await compiler.evaluate("./src/index.tsx");
```

## Babel

## Babel’s Presets and Plugins

We can load presets and plugins from [esm.sh](https://esm.sh). Like that:

```js
// It's an example to load tsx (SolidJS)
import SolidPresets from "https://esm.sh/babel-preset-solid@1.3.13";
import { babel } from "https://fastly.jsdelivr.net/npm/rollup-web@3/dist/plugins/babel.js";

const RollupConfig = {
    plugins: [
        // after load presets we just use it!
        babel({
            babelrc: {
                presets: [
                    SolidPresets,
                    [
                        // When we want to support TS, use this
                        Babel.availablePresets["typescript"],
                        {
                            isTSX: true,
                            allExtensions: true,
                        },
                    ],
                ],
            },
            // you need add .tsx to recognize your code
            extensions: [".tsx", ".ts"],
            log(id) {
                console.warn("> " + id);
            },
        }),
    ],
};
```

> But don't load presets and plugins from Skypack or JsDelivr CDN, the code they provided couldn't run well in the browser!

> So, don't use `.js` in typescript to load a ts file, It will raise a load error.

## Any other thing！

None
