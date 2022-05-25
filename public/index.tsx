/**@ts-ignore */
import { createSignal } from "solid-js";
/**@ts-ignore */
import { render } from "solid-js/web";
const App = () => {
    const [count, setCount] = createSignal(100);
    return (
        <div>
            <header>
                <p>这是一个 SolidJS 的渲染测试</p>
                <a
                    href="https://github.com/solidjs/solid"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Solid JS 是一个框架，这个 DOM 是由本地打包的哦！
                </a>
            </header>
        </div>
    );
};
render(App, document.body);
