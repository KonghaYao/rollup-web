import get from "lodash-es/get";
import { Plugin } from "rollup";
import { addExtension } from "@rollup/pluginutils";
import { wrapPlugin } from "../utils/wrapPlugin";
import { relativeResolve } from "../utils/pathUtils";
import { extname } from "../shim/_/path";

type stringObject = {
    [str: string]: stringObject | string;
};

const _obj_module = ({
    /** 树状文件结构 */
    files,
    log,
    extensions = [],
}: {
    files: stringObject;
    extensions?: string[];
    log?: (code: string) => void;
}) => {
    return {
        name: "object_module",
        resolveId(thisFile: string, importer: string = "/") {
            const first = thisFile.charAt(0);
            if (first === "." || first === "/") {
                let resolved = relativeResolve(importer, thisFile);
                if (extname(resolved) === "") {
                    for (let ext of extensions) {
                        const url = addExtension(resolved, ext);
                        const isExist: string | undefined = getDataFrom(
                            files,
                            url
                        );
                        if (isExist) return url;
                    }
                } else {
                    return resolved;
                }
            }
            return;
        },
        load(id) {
            // 从这里进行导入
            const target = getDataFrom(files, id);
            log && log(id);
            return typeof target !== "string" ? JSON.stringify(target) : target;
        },
    } as Plugin;
};
const getDataFrom = (obj: any, path: string) => {
    const pathArray = path
        .split("/")
        .filter((i) => i && i !== "." && i !== "..");

    return get(obj, pathArray);
};

/** 解析 相对路径 到 files 对象
 *
 * @param extensions 路径自动添加后缀名测试
 */
export const obj_module = wrapPlugin(_obj_module, {
    extensions: [".js"],
});
