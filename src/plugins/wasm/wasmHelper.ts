// copy from vite and do some changes.(*^_^*)
// https://github.com/vitejs/vite/blob/main/packages/vite/src/node/plugins/wasm.ts
/**
 * 注入全局的 wasm 配置器
 * @param url DataUrl 或者是一个 url 指向 wasm 二进制文件
 */
export const wasmHelper = async (opts: any = {}, url: string) => {
    let result;

    if (url.startsWith("data:")) {
        // 如果 url 是 DataUrl
        const binaryString = atob(url.replace(/^data:.*?base64,/, ""));
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        result = await WebAssembly.instantiate(bytes, opts);
    } else {
        // 这个是普通 URL 的链接，指向一个 wasm 文件
        // https://github.com/mdn/webassembly-examples/issues/5
        // WebAssembly.instantiateStreaming requires the server to provide the
        // correct MIME type for .wasm files, which unfortunately doesn't work for
        // a lot of static file servers, so we just work around it by getting the
        // raw buffer.
        const response = await fetch(url);
        const contentType = response.headers.get("Content-Type") || "";
        if (
            "instantiateStreaming" in WebAssembly &&
            contentType.startsWith("application/wasm")
        ) {
            result = await WebAssembly.instantiateStreaming(response, opts);
        } else {
            const buffer = await response.arrayBuffer();
            result = await WebAssembly.instantiate(buffer, opts);
        }
    }
    return result.instance;
};
