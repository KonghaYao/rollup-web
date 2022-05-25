import type {
    CompressCallback,
    InputType,
    BrotliOptions,
    brotliCompress as _brotliCompress,
} from "zlib-bundle";
import { Buffer } from "buffer";

// 必须要使用这种方式进行导入
import br from "nv-browser-brotli";
const { compress, decompress } = br;

// 压缩方式
function brCompress(buffer: InputType, callback: CompressCallback): void;
function brCompress(
    buffer: InputType,
    options: BrotliOptions,
    callback: CompressCallback
): void;
function brCompress(...args: any[]) {
    let buffer: InputType = "",
        callback: CompressCallback,
        options: BrotliOptions = {};
    switch (args.length) {
        case 2:
            [buffer, callback] = args;
            break;
        case 3:
            [buffer, options, callback] = args;
            break;
    }
    _brCompress(buffer, options)
        .then((data) => {
            if (data) {
                callback.call(null, null, Buffer.from(data));
            }
            throw "br 压缩数据为空";
        })
        .catch((e) => {
            callback.call(null, e as Error, null as any);
        });
}
const _brCompress = async (buffer: InputType, options?: BrotliOptions) => {
    if (typeof buffer === "string") {
        buffer = await new Blob([buffer]).arrayBuffer();
    }
    if (buffer instanceof ArrayBuffer) {
        return compress(Buffer.from(buffer), {});
    }
};
brCompress.__promisify__ = _brCompress;
export const brotliCompress = brCompress as typeof _brotliCompress;
