import M from "@/test/index.json";
import a from "./global";
// 这里应该自动失败到 .cjs 文件
import b from "./index";
export default M;
export { a, b };
