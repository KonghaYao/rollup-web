const EventEmitter = require("events");
const events = new EventEmitter();
const noop = () => {};
const FS = {
    readFile(path, options, callback) {
        return new Promise(async (resolve) => {
            for (let i of FS._readFile.filters) {
                const result = await i(path, options);
                if (typeof result === "string") {
                    if (callback) {
                        callback(null, result);
                    } else {
                        resolve(result);
                    }
                    return;
                }
            }
            const error = new Error("没有找到文件 " + path);
            if (callback) {
                callback(error, null);
            } else {
                throw error;
            }
        });
    },
    // 如果需要同步取用，那么先向 _readFileSync 注入数据
    readFileSync(path) {
        return this._readFileSync.store.get(path);
    },
    _readFileSync: {
        store: new Map(),
    },
    _readFile: {
        filters: [],
    },
    realpath: noop,
    stat: noop,
    access: noop,
    mkdir: noop,
    writeFile(filename, fileContent, callback) {
        events.emit("writeFile", filename, fileContent);
    },
    _events: events,
};
FS.promises = FS;
globalThis.__setFs__ = (fs) => {
    Object.assign(FS, fs);
};
globalThis.fs = FS;
module.exports = FS;
// 必须使用 commonjs 形式保证导入的时候不会出错
