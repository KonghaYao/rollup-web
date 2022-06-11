/* 用来包裹全局的 URL 对象，保证对象解析为 sandbox 正确的地址 */
export const wrapper = function (baseURL: string) {
    return `(${wrapURL.toString()})('${baseURL}');
    (${wrapRequest.toString()})('${baseURL}');
    (${wrapFetch.toString()})('${baseURL}');
    `;
};

export const wrapURL = function (baseURL: string) {
    const URL = globalThis.URL;
    globalThis.URL = new Proxy(URL, {
        construct(target, argArray) {
            const [url, _baseURL] = argArray;
            if (_baseURL) {
                return new target(url, _baseURL);
            }
            return new target(url, baseURL);
        },
    });
};

export const wrapRequest = function (baseURL: string) {
    const real = globalThis.Request;
    globalThis.Request = new Proxy(real, {
        construct(target, argArray) {
            const [url, options] = argArray;
            // 注意，只拦截字符串，而不拦截 url，
            // 因为 url 可能是已经被 wrap 的
            if (typeof url === "string") {
                return new target(new URL(url, baseURL), options);
            }
            return new target(url, options);
        },
    });
};

export const wrapFetch = function (baseURL: string) {
    const realFetch = globalThis.fetch;
    globalThis.fetch = function (url, options) {
        if (typeof url === "string") {
            return realFetch(new URL(url, baseURL), options);
        }
        return realFetch(url, options);
    } as typeof globalThis.fetch;
    globalThis.fetch.toString = realFetch.toString;
};
