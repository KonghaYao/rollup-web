export * from "url-bundle";
import { toASCII as domainToASCII } from "punycode";
import { CHAR_FORWARD_SLASH, CHAR_BACKWARD_SLASH } from "./constants";

import path from "path";
const Error = (...args: any[]) => args.join(" ");
function isURLInstance(fileURLOrPath: URL) {
    return fileURLOrPath != null && fileURLOrPath.href && fileURLOrPath.origin;
}

export function fileURLToPath(path: string | URL) {
    if (typeof path === "string") path = new URL(path);
    else if (!isURLInstance(path)) throw Error("path", ["string", "URL"], path);
    if (path.protocol !== "file:") throw Error("file");
    return getPathFromURLPosix(path);
}

function getPathFromURLPosix(url: URL) {
    if (url.hostname !== "") {
        throw Error(" getPathFromURLPosix error");
    }
    const pathname = url.pathname;
    for (let n = 0; n < pathname.length; n++) {
        if (pathname[n] === "%") {
            const third = pathname.codePointAt(n + 2)! | 0x20;
            if (pathname[n + 1] === "2" && third === 102) {
                throw Error("must not include encoded / characters");
            }
        }
    }
    return decodeURIComponent(pathname);
}
const isWindows = false;
const percentRegEx = /%/g;
const backslashRegEx = /\\/g;
const newlineRegEx = /\n/g;
const carriageReturnRegEx = /\r/g;
const tabRegEx = /\t/g;

function encodePathChars(filepath: string) {
    if (filepath.includes("%"))
        filepath = filepath.replace(percentRegEx, "%25");
    // In posix, backslash is a valid character in paths:
    if (!isWindows && filepath.includes("\\"))
        filepath = filepath.replace(backslashRegEx, "%5C");
    if (filepath.includes("\n"))
        filepath = filepath.replace(newlineRegEx, "%0A");
    if (filepath.includes("\r"))
        filepath = filepath.replace(carriageReturnRegEx, "%0D");
    if (filepath.includes("\t")) filepath = filepath.replace(tabRegEx, "%09");
    return filepath;
}
export function pathToFileURL(filepath: string) {
    const outURL = new URL("file://");
    if (isWindows && filepath.startsWith("\\\\")) {
        // UNC path format: \\server\share\resource
        const paths = filepath.split("\\");
        if (paths.length <= 3) {
            throw Error("filepath", filepath, "Missing UNC resource path");
        }
        const hostname = paths[2];
        if (hostname.length === 0) {
            throw Error("filepath", filepath, "Empty UNC servername");
        }
        outURL.hostname = domainToASCII(hostname);
        outURL.pathname = encodePathChars(paths.splice(3).join("/"));
    } else {
        let resolved = path.resolve(filepath);
        // path.resolve strips trailing slashes so we must add them back
        const filePathLast = filepath.charCodeAt(filepath.length - 1);
        if (
            (filePathLast === CHAR_FORWARD_SLASH ||
                (isWindows && filePathLast === CHAR_BACKWARD_SLASH)) &&
            resolved[resolved.length - 1] !== path.sep
        )
            resolved += "/";
        outURL.pathname = encodePathChars(resolved);
    }
    return outURL;
}
