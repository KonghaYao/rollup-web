/** Randomizes the specified array's values. */
export function randomizeArray(arr: Int32Array): Int32Array {
    for (let i = 0, k = arr.length; i < k; ++i) {
        let value = i32((Math.random() * 2.0 - 1.0) * i32.MAX_VALUE);
        unchecked((arr[i] = value));
    }
    return arr;
}

/** Computes the sum of an array's values and returns the sum to JavaScript. */
export function sumArray(arr: Int32Array): i32 {
    let total = 0;
    for (let i = 0, k = arr.length; i < k; ++i) {
        total += unchecked(arr[i]);
    }
    return total;
}
