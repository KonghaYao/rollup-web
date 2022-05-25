import "buffer";
export function getDynamic() {
    return import("./test/index.json");
}
export function getEditableImport(place) {
    return import(`./test/${place}.json`);
}
