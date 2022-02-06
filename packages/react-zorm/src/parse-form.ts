import { setIn } from "./set-in";
import { GenericSchema } from "./types";

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
): ReturnType<P["safeParse"]> {
    return schema.safeParse(parseFormAny(form));
}
