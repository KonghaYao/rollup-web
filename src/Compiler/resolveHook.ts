import { useGlobal } from "../utils/useGlobal";

const System = useGlobal<any>("System");
export const resolveHook = () => {
    const resolve = System.resolve;
    System.resolve = (url: string, par: string) => {
        if (url.startsWith(".") || url.startsWith("/"))
            return resolve.call(System, url, par);
        return url;
    };
};
