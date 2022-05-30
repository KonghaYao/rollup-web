const successSet = new Set<string>();
// 从 url 加载一个 script
export const loadScript = async (
    url: string,
    attr: any = {},
    to = document.body
) => {
    if (successSet.has(url)) return true;

    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = url;
        Object.entries(attr).forEach(([key, value]) => {
            script.setAttribute(key, value as string);
        });
        script.onload = () => {
            successSet.add(url);
            resolve(true);
        };
        script.onerror = (e) => {
            reject(e);
        };
        to.appendChild(script);
    });
};

// 从 url 加载一个 link
export const loadLink = (url: string) => {
    if (successSet.has(url)) return true;
    return new Promise((resolve, reject) => {
        const script = document.createElement("link");
        script.href = url;
        script.rel = "stylesheet";
        script.onload = () => {
            successSet.add(url);
            resolve(true);
        };
        script.onerror = (e) => {
            reject(e);
        };
        document.head.appendChild(script);
    });
};
