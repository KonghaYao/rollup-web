/* 用来包裹全局的 URL 对象，保证对象解析为 sandbox 正确的地址。但是 像 location 这样的运行时不会进行 wrap */
export const wrapper = function (baseURL: string) {
    return `(${wrapURL.toString()})('${baseURL}');
    (${wrapRequest.toString()})('${baseURL}');
    (${wrapFetch.toString()})('${baseURL}');
    (${wrapXHR.toString()})('${baseURL}');
    `;
};

export const wrapAll = function (baseURL: string) {
    [wrapURL, wrapRequest, wrapFetch, wrapXHR].forEach((i) => {
        i(baseURL);
    });
};

export const wrapURL = function (baseURL: string) {
    const URL = globalThis.URL;
    globalThis.URL = new Proxy(URL, {
        construct(target, argArray) {
            const [url, _baseURL] = argArray as [string, string];
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
        construct(
            target,
            argArray: [URL | RequestInfo, RequestInit | undefined]
        ) {
            const [url, options] = argArray;
            // 注意，只拦截字符串，而不拦截 url，
            // 因为 url 可能是已经被 wrap 的
            if (typeof url === "string") {
                /* @ts-ignore */
                return new target(new URL(url, baseURL), options);
            }
            /* @ts-ignore */
            return new target(url, options);
        },
    });
};

export const wrapFetch = function (baseURL: string) {
    const realFetch = globalThis.fetch;
    globalThis.fetch = function (url, options) {
        if (typeof url === "string") {
            /* @ts-ignore */
            return realFetch(new URL(url, baseURL), options);
        }
        return realFetch(url, options);
    } as typeof globalThis.fetch;
    globalThis.fetch.toString = () => "function fetch() { [native code] }";
};

export const wrapXHR = function (baseURL: string) {
    const Open = globalThis.XMLHttpRequest.prototype.open;
    globalThis.XMLHttpRequest.prototype.open = function (
        this: XMLHttpRequest,
        method,
        url,
        async,
        username,
        password
    ) {
        if (typeof url === "string") {
            return Open.call(
                this,
                method,
                new URL(url, baseURL).toString(),
                async,
                username,
                password
            );
        }
        return Open.call(this, method, url, async, username, password);
    } as typeof globalThis.XMLHttpRequest.prototype.open;
    globalThis.XMLHttpRequest.prototype.open.toString = () =>
        "function open() { [native code] }";
};
