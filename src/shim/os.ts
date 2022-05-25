import os from "os-bundle";
export * from "os-bundle";
export const homedir = () => {
    return globalThis.location.origin;
};

export const commonjsRequire = (module: string) => {
    return (globalThis as any)[module];
};
const OS = {
    ...os,
    homedir,
    commonjsRequire,
};
(globalThis as any).os = OS;
export default OS;
