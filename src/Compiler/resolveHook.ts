import { useGlobal } from "../utils/useGlobal";

export const resolveHook = () => {
    const System = useGlobal<any>("System");
    const resolve = System.resolve;
    System.resolve = (url: string, par: string) => {
        if (url.startsWith(".") || url.startsWith("/"))
            return resolve.call(System, url, par);
        return url;
    };
};
