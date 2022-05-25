import { createApp } from "vue";
import App from "./index.vue";
const div = document.createElement("div");
div.id = "app";
document.body.appendChild(div);
createApp(App).mount("#app");
