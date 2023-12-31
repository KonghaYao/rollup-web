import { process } from "./_/process";
Object.assign(process, {
    cwd() {
        return globalThis.location.href;
    },
    platform: "false",
    env: {
        NODE_DEBUG: false,
    },
});
(globalThis as any).process = process;
export default process;
export { process };
