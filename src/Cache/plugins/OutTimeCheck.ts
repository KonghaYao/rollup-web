import { log } from "../../utils/ColorConsole";
import { createStore } from "../createStore";
import { CachePlugin } from "../Types";

/**
 * @property name 储存超时库的 key 值
 * @property maxAge 以秒计时
 * */
export const OutTimeCheck = ({
    name,
    maxAge,
}: {
    maxAge: number;
    name: string;
}) => {
    const store = createStore({
        name: "__rollup_web_outTime__",
    });
    const checkOutTime = async () => {
        const lastTime: number | null = (await store.getItem(name)) || 0;
        if (Date.now() - lastTime > maxAge * 1000) {
            return null;
        }
        return;
    };
    const runtimeCheck: CachePlugin<string>["get"] = async function (this) {
        if (firstCheck === false && (await checkOutTime()) === null) {
            // 删除缓存是整片删除，所以不需要每次都进行检测

            log.red("Cache | out time clear Cache");
            await this.clear();
            firstCheck = true;
        }
    };
    let firstCheck = false;
    let setTime = false;
    return {
        name: "out_time_check",
        get: runtimeCheck,
        has: runtimeCheck,
        async set(key, value) {
            // console.log("写入时间记录");
            if (setTime === false) {
                // 注意，在整个活动时间内，没有必要每次写入进行一个操作，而是每次打开页面第一次写入的时候，写入时间即可
                await store.setItem(name, Date.now());
                setTime = true;
            }
            return;
        },
        async clear() {
            await store.setItem(name, 100);
        },
    } as CachePlugin<string>;
};
