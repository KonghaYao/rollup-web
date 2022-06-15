import { Plugin } from "rollup-web";
import { wrapPlugin } from "../utils/wrapPlugin";

export const _assets = ({}: {} = {}) => {
    return {
        name: "assets",
        load(id) {
            return `export default '${id}'`;
        },
    } as Plugin;
};

export const defaultAssetsExtensions = [
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".svg",

    ".mp4",
    ".mp3",
    ".wav",
    ".ogg",
    ".gif",

    ".ttf",
    ".woff",
    ".woff2",
];
/**
 * assets 是处理静态图片或者其他文件导入的插件
 * @example url 会被封装为 export default url 进行使用
 */
export const assets = wrapPlugin(_assets, {
    extensions: defaultAssetsExtensions,
});
