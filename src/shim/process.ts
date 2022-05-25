import process from "process-bundle";
Object.assign(process, {
    cwd() {
        return window.location.href;
    },
    platform: "false",
    env: {
        NODE_DEBUG: false,
    },
});
(globalThis as any).process = process;
export default process;
export { process };
