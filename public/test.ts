import M from "@/test/index.json";
import a, { getDynamic } from "./global";
// 这里应该自动失败到 .cjs 文件
import process from "./index";
export default M;
export { a, process, getDynamic };
