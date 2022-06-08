export const isURLString = (url: string) => {
    return /^(https?|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/.test(
        url
    );
};
export const URLResolve = (relative: string, baseURL: string) => {
    return new URL(relative, bareURL(baseURL)).toString();
};
export const bareURL = (url: string) => url.split(/\#|\?/g, 1)[0];
