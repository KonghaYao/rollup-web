export enum ConsoleType {
    log,
    info,
    warn,
    success,
    error,
    time,
    group,
    groupEnd,
    trace,
    dir,
    assert,
}

export interface ConsoleRecord {
    type: ConsoleType;
    args: any[];
}
/** 全局的 console */
const Console: Console = window.console;

export default function createConsole() {
    const now = () => new Date().getTime();

    return {
        times: {},
        history: [],

        clear() {
            this.history = [];
            console.warn("清空控制台");
        },
        log(...args: any[]) {
            const record: ConsoleRecord = {
                type: ConsoleType.log,
                args,
            };
            this.history.push(record);
            Console.log(...args);
        },
        info(...args: any[]) {
            this.history.push({
                type: ConsoleType.info,
                args,
            });
            Console.info(...args);
        },
        success(...args: any[]) {
            this.history.push({
                type: ConsoleType.success,
                args,
            });
            Console.info(...args);
        },
        warn(...args: any[]) {
            this.history.push({
                type: ConsoleType.warn,
                args,
            });
            Console.warn(...args);
        },
        error(...args: any[]) {
            this.history.push({
                type: ConsoleType.error,
                args,
            });
            Console.error(...args);
        },
        time(label: string) {
            this.times[label] = now();
            Console.time(label);
        },
        timeEnd(label: string) {
            Console.timeEnd(label);
            const time = this.times[label];
            delete this.times[label];
            if (!time) {
                throw new Error("No such label: " + label);
            }

            const duration = now() - time;
            const info = label + ": " + duration + "ms";
            this.history.push({
                type: ConsoleType.time,
                args: [info],
            });
        },
        group(label: string) {
            this.history.push({
                type: ConsoleType.group,
                args: [label],
            });
            Console.group(label);
        },
        groupEnd() {
            for (let index = this.history.length - 1; index >= 0; index--) {
                const lastGroup = this.history[index];
                if (lastGroup.type === ConsoleType.group) {
                    this.history.push({
                        type: ConsoleType.groupEnd,
                        args: [],
                    });
                    Console.groupEnd();
                    break;
                }
            }
        },
        trace() {
            const err = new Error();
            err.name = "Trace";
            this.history.push({
                type: ConsoleType.trace,
                args: [err.stack],
            });
            Console.error(err.stack);
        },
        dir(obj: any) {
            this.history.push({
                type: ConsoleType.dir,
                args: [obj],
            });
            Console.dir(obj);
        },
        assert(expression: boolean, ...args: any) {
            if (!expression) {
                this.history.push({
                    type: ConsoleType.assert,
                    args,
                });
                Console.assert(expression, ...args);
            }
        },
    } as any as Console;
}
