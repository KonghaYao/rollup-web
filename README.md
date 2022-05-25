# rollup in Browser!

Simply use rollup to bundle esm or commonjs or typescript code in browser! We have a easy way to do that!

# Get Start

```js
import {
    useRollup,
    web_module,
    sky_module,
    ModuleEval,
} from "https://cdn.jsdelivr.net/npm/rollup-web/dist/index.js";

// 导入各种插件
// ! Use esm.sh CDN to load some plugins that don't need to adapt
import { json } from "https://esm.sh/@rollup/plugin-json";
import { alias } from "https://esm.sh/@rollup/plugin-alias";
import { commonjs } from "https://esm.sh/@rollup/plugin-commonjs";
import { replace } from "https://esm.sh/@rollup/plugin-replace";

// Babel and SWC need to init first and use the plugin inside rollup-web
import {
    initBabel,
    babel,
} from "https://cdn.jsdelivr.net/npm/rollup-web/dist/plugins/babel.js";
import {
    initSwc,
    swcPlugin,
} from "https://cdn.jsdelivr.net/npm/rollup-web/dist/plugins/swc.js";
import mocha from "https://esm.run/mocha/mocha.js";

// swc, babel must init before used.
// await initBabel();
await initSwc();

const config = {
    input: "./public/test.ts",
    output: {
        format: "es",
    },
    plugins: [
        json(),
        alias({
            entries: [{ find: "@", replacement: "./" }],
        }),
        commonjs({
            extensions: [".cjs", ".js"],
        }),

        replace({
            __buildDate__: () => JSON.stringify(new Date()),
            __buildVersion: "15",
        }),

        // You can use Babel to compile Typescript! Or other awesome code!
        // babel({
        //     babelrc: {
        //         presets: [Babel.availablePresets.typescript],
        //     },
        //     extensions: [".ts"],
        // }),

        // Swc plugin is used to compile typescript to esm! Yes! Typescript! But dependencies more bigger then babel.
        swcPlugin({
            log(id) {
                console.warn("> " + id);
            },
        }),

        // web_module can get code file from your web site!
        web_module({
            // 如果不设置 root， 则是相对于网页的 url 进行获取
            // 甚至可以对 npm 包进行动态打包！
            // root: 'https://cdn.jsdelivr.net/npm/skypack-api/',
            extension: ".ts",

            log(url) {
                console.log("%c " + url, "color:green");
            },
        }),

        // some package in node_module (We don't use it!) will be redirected to a ESM cdn! (if it can run in the browser...)
        // but we actually don't download the source code!
        sky_module({
            cdn: "https://esm.run/",
        }),
    ],
};
const res = await useRollup(config);

// just run the cooked code !
const module = await ModuleEval(res);
```

## Babel

## Babel’s Presets and Plugins

We can load presets and plugins from [esn.sh](https://cdn.esm.sh). Like that:

```js

// It's an example to load tsx (SolidJS)
import SolidPresets from 'https://esm.sh/babel-preset-solid@1.3.13';

// after load presets we just use it!
babel({
    babelrc: {
        presets: [SolidPresets],
    },
    // you need add .tsx to load your file
    extensions: [".tsx"],
    log(id) {
        console.warn("> " + id);
    },
}),
```

> But don't load presets and plugins from Skypack or JsDelivr CDN, the code they provide can't run in the browser!

## Auto Complete ExtName

When Rollup-web find your import url (or path) doesn't have a ExtName, It will be auto completed!

> So, don't use `.js` in typescript to load a ts file, It will raise a load error.

## Auto Dynamic Import Bundle

When you write a js module that dynamic import other file，Rollup-web will load the Module when your code require it.

```ts
import {
    useRollup，
    DynamicServer,
} from "rollup-web";

const config = {
    // 直接采用 src 目录下的 index.ts 进行打包实验
    input: "./src/index.tsx",
    output: {
        format: "es",
    },
    plugins: [
        // 这是一种异步导入方案，使用 全局的一个外置 Server 来保证代码的正确执行
        server.createPlugin({}),
    ],
};
/** please init server before your eval your code */
server.registerRollupPlugins(config.plugins);
```

> There is important thing that Rollup will bundle A who depended C and dynamic importing B (B also depended C), when dynamic load B , B has a single module C inside. The C isn't the same in A and B, But using esm module , it should be the same.
> Many times it will be harmless, but when C register a global variable, it will cause a chaos.
