import M from "@/test/index.json";
import a, { getDynamic } from "./global";
// 这里应该自动失败到 .cjs 文件
import process from "./index";
export default M;

export { a, process, getDynamic };
export const setData = (date: number) => {
    a._buildDate_ = date;
};
export const getData = () => {
    return import("./global").then((res) => {
        return res.default._buildDate_;
    });
};
