import Post from "./index.mdx";
// react version
// import { render } from "react-dom";
// import { MDXProvider } from "@mdx-js/react";
import { render } from "solid-js/web";
import { MDXProvider } from "solid-jsx/jsx-runtime";

function App() {
    return (
        <MDXProvider>
            <Post />
        </MDXProvider>
    );
}
const div = document.createElement("div");
div.id = "mdx";
document.body.appendChild(div);
render(<App />, div);
