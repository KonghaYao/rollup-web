import Post from "./index.mdx";
import { render } from "react-dom";
import { MDXProvider } from "@mdx-js/react";

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
