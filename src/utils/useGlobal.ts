/** 获取全局的变量 */
export const useGlobal = <T>(globalName: string) => {
    return (globalThis as any)[globalName] as T;
};
export const setGlobal = <T>(globalName: string, anything: T) => {
    (globalThis as any)[globalName] = anything;
    return anything;
};
