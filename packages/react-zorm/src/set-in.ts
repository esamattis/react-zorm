/**
 * Ported to TypeScript from https://github.com/final-form/final-form/blob/ad1997b70de21df336331da466523534b5bdb63c/src/structure/toPath.js
 * https://github.com/final-form/final-form/blob/ad1997b70de21df336331da466523534b5bdb63c/LICENSE
 * Copyright (c) 2017 Erik Rasmussen
 * Copyright JS Foundation and other contributors <https://js.foundation/>
 * Based on Underscore.js, copyright Jeremy Ashkenas,
 *
 * Structure Tester
 * https://8ypq7n41z0.codesandbox.io/
 */

type State = any;

const charCodeOfDot = ".".charCodeAt(0);
const reEscapeChar = /\\(\\)?/g;
const rePropName = RegExp(
    // Match anything that isn't a dot or bracket.
    "[^.[\\]]+" +
        "|" +
        // Or match property names within brackets.
        "\\[(?:" +
        // Match a non-string expression.
        "([^\"'][^[]*)" +
        "|" +
        // Or match strings (supports escaping characters).
        "([\"'])((?:(?!\\2)[^\\\\]|\\\\.)*?)\\2" +
        ")\\]" +
        "|" +
        // Or match "" as the space between consecutive dots or empty brackets.
        "(?=(?:\\.|\\[\\])(?:\\.|\\[\\]|$))",
    "g",
);

/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */
const stringToPath = (string: string) => {
    const result = [];
    if (string.charCodeAt(0) === charCodeOfDot) {
        result.push("");
    }
    string.replace(rePropName, (match, expression, quote, subString) => {
        let key = match;
        if (quote) {
            key = subString.replace(reEscapeChar, "$1");
        } else if (expression) {
            key = expression.trim();
        }
        result.push(key);

        return "";
    });
    return result;
};

const keysCache: { [key: string]: string[] } = {};

const toPath = (key: string): string[] => {
    if (key === null || key === undefined || !key.length) {
        return [];
    }
    if (typeof key !== "string") {
        throw new Error("toPath() expects a string");
    }

    if (keysCache[key] == null) {
        keysCache[key] = stringToPath(key);
    }
    return keysCache[key]!;
};

const setInRecursor = (
    current: State,
    index: number,
    path: string[],
    value: any,
    destroyArrays: boolean,
): State => {
    if (index >= path.length) {
        // end of recursion
        return value;
    }
    const key = path[index]!;

    // determine type of key
    if (isNaN(key as any)) {
        // object set
        if (current === undefined || current === null) {
            // recurse
            const result = setInRecursor(
                undefined,
                index + 1,
                path,
                value,
                destroyArrays,
            );

            // delete or create an object
            return result === undefined ? undefined : { [key]: result };
        }
        if (Array.isArray(current)) {
            throw new Error("Cannot set a non-numeric property on an array");
        }
        // current exists, so make a copy of all its values, and add/update the new one
        const result = setInRecursor(
            current[key],
            index + 1,
            path,
            value,
            destroyArrays,
        );
        if (result === undefined) {
            const numKeys = Object.keys(current).length;
            if (current[key] === undefined && numKeys === 0) {
                // object was already empty
                return undefined;
            }
            if (current[key] !== undefined && numKeys <= 1) {
                // only key we had was the one we are deleting
                if (!isNaN(path[index - 1] as any) && !destroyArrays) {
                    // we are in an array, so return an empty object
                    return {};
                } else {
                    return undefined;
                }
            }
            const { [key]: _removed, ...final } = current;
            return final;
        }
        // set result in key
        return {
            ...current,
            [key]: result,
        };
    }
    // array set
    const numericKey = Number(key);
    if (current === undefined || current === null) {
        // recurse
        const result = setInRecursor(
            undefined,
            index + 1,
            path,
            value,
            destroyArrays,
        );

        // if nothing returned, delete it
        if (result === undefined) {
            return undefined;
        }

        // create an array
        const array = [];
        array[numericKey] = result;
        return array as any[];
    }
    if (!Array.isArray(current)) {
        throw new Error("Cannot set a numeric property on an object");
    }
    // recurse
    const existingValue = current[numericKey];
    const result = setInRecursor(
        existingValue,
        index + 1,
        path,
        value,
        destroyArrays,
    );

    // current exists, so make a copy of all its values, and add/update the new one
    const array = [...current];
    if (destroyArrays && result === undefined) {
        array.splice(numericKey, 1);
        if (array.length === 0) {
            return undefined;
        }
    } else {
        array[numericKey] = result;
    }
    return array;
};

export const setIn = (state: {}, key: string, value: any): any => {
    if (state === undefined || state === null) {
        throw new Error(`Cannot call setIn() with ${String(state)} state`);
    }
    if (key === undefined || key === null) {
        throw new Error(`Cannot call setIn() with ${String(key)} key`);
    }
    // Recursive function needs to accept and return State, but public API should
    // only deal with Objects
    return setInRecursor(state, 0, toPath(key), value, false) as any;
};
