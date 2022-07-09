import { ModuleConfig } from "../../adapter/web_module";
/* 覆盖全局的 Location */
export function createLocationCode(env: string, config: ModuleConfig) {
    let locationCode;
    if (env === "iframe") {
        // ! 在 iframe 中使用 let ，而 worker 中使用 var 进行覆盖声明
        locationCode = `let location = (${locationCover.toString()})("${
            config.root as string
        }");`;
    } else {
        locationCode = `var location = (${locationCover.toString()})("${
            config.root as string
        }");`;
    }
    return locationCode;
}

/* 会被字符串化的函数 */
const locationCover = (url: string) => {
    const info = new URL(url);
    const data = [
        "hash",
        "host",
        "hostname",
        "href",
        "origin",
        "pathname",
        "port",
        "protocol",
        "search",
    ].reduce((col, cur) => {
        col[cur] = (info as any)[cur];
        return col;
    }, {} as any);
    // 修改这个接口实现不同的参数传递
    const result = Object.assign(data, {
        assign() {},
        ancestorOrigins: { length: 0 },
        reload() {},
        replace() {},
        toString() {},
    });

    return result;
};
