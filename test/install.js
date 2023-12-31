import mocha from "https://fastly.jsdelivr.net/npm/mocha/mocha.js/+esm";
// 不能使用对象的方式进行 mocha 配置，不然会出错
mocha.setup("bdd");
mocha.checkLeaks();

const paths = window.location.hash.replace("#", "").split("|");
if (paths) {
    await Promise.all(
        paths.map((path) => {
            return import(
                /** @vite-ignore */
                `./${path}.js`);
        })
    );
}
mocha.run();
