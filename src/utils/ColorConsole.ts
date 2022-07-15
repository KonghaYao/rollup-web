export const colors = {
    red: "fee2e2",
    lime: "ecfccb",
    green: "dcfce7",
    teal: "ccfbf1",
    sky: "e0f2fe",
    blue: "bfdbfe",
    purple: "ede9fe",
    pink: "fce7f3",
} as const;
type Color = keyof typeof colors;
const inner = Object.entries(colors).reduce(
    (col, [colorName, hex]) => {
        col[colorName as Color] = (...args: any[]) =>
            console.log(
                ...args.flatMap((i) => {
                    if (typeof i === "string")
                        return [
                            "%c" + i,
                            `background-color:#${hex};color:black;`,
                        ];
                    return [i];
                })
            );
        return col;
    },
    {} as {
        [key in Color]: (...args: any[]) => void;
    }
);
const _log = (...args: any[]) => {
    return console.log(...args);
};

export const log = Object.assign(_log, inner);
