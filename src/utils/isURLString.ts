export const isURLString = (url: string) => {
    return /^(blob:)?(https?|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/.test(
        url
    );
};
export const URLResolve = (relative: string, baseURL: string) => {
    const root = bareURL(baseURL);

    return new URL(relative, root).toString();
};
export const bareURL = (url: string) => url.split(/\#|\?/g)[0];
export const URLDir = (url: string) => bareURL(url).replace(/\/[^\/]*?$/, "/");
