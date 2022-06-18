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
        const lastTime: number = (await store.getItem(name)) || 0;
        if (Date.now() - lastTime > maxAge * 1000) {
            return null;
        }
        return;
    };
    return {
        name: "out_time_check",
        async get(key) {
            return checkOutTime();
        },
        async set(key, value) {
            store.setItem(name, Date.now());
            return;
        },
        async has(key) {
            return checkOutTime();
        },
    } as CachePlugin<string>;
};
