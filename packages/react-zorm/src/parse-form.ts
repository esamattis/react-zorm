import { SafeParseReturnType } from "zod";
import { setIn } from "./set-in";
import { GenericSchema } from "./types";

/**
 * Fix sparse array from nested objects. Puts undefineds to array holes.
 */
function fixHoles(ob: object | any[]) {
    if (Array.isArray(ob)) {
        const array = ob;
        for (let index = 0, length = array.length; index < length; index++) {
            if (!(index in array)) {
                array[index] = undefined;
            } else {
                fixHoles(array[index]);
            }
        }
    }

    if (ob === null) {
        return;
    }

    if (typeof ob === "object") {
        for (const value of Object.values(ob)) {
            fixHoles(value);
        }
    }
}

/**
 * Parse nested data from a form element or a FormData object.
 *
 * Ex. <input name="ding[0].dong" value="value" />
 *
 *     =>  { ding: [ {dong: "value"} ] }
 *
 * Inspired by Final Form. See https://8ypq7n41z0.codesandbox.io/
 */
export function parseFormAny(form: HTMLFormElement | FormData) {
    let data: FormData;
    if ("onsubmit" in form) {
        data = new FormData(form);
    } else {
        data = form;
    }

    let ret: any = {};

    for (const [key, value] of data.entries()) {
        ret = setIn(ret, key, value);
    }

    // Remove sparse arrays as Zod does not like them.
    // XXX Should probably just fix setIn() to avoid sparse arrays.
    fixHoles(ret);

    return ret;
}

export function parseForm<P extends GenericSchema>(
    schema: P,
    form: HTMLFormElement | FormData,
): ReturnType<P["parse"]> {
    return schema.parse(parseFormAny(form));
}

export function safeParseForm<P extends GenericSchema>(
    schema: P,
    form: HTMLFormElement | FormData,
): SafeParseReturnType<any, ReturnType<P["parse"]>> {
    return schema.safeParse(parseFormAny(form));
}
