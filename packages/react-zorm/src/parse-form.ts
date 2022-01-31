import { createFieldsProxy } from "./generate-path";
import { setIn } from "./set-in";
import { FieldsFromSchema, SimpleSchema } from "./types";

export function parseFormAny(form: HTMLFormElement | FormData) {
    let data: FormData;
    if ("onsubmit" in form) {
        data = new FormData(form);
    } else {
        data = form;
    }

    let ret: any = {};
    // https://8ypq7n41z0.codesandbox.io/

    for (const [key, value] of data.entries()) {
        ret = setIn(ret, key, value);
    }

    // data.forEach((value, key) => {
    //     ret = setIn(ret, key, value);
    // });

    return ret;
}

export function parseForm<P extends SimpleSchema>(
    parser: P,
    form: HTMLFormElement | FormData,
): ReturnType<P["parse"]> {
    return parser.parse(parseFormAny(form));
}

export function safeParseForm<P extends SimpleSchema>(
    parser: P,
    form: HTMLFormElement | FormData,
): ReturnType<P["safeParse"]> {
    return parser.safeParse(parseFormAny(form));
}

export function createFields<P extends SimpleSchema>(
    ns: string,
    parser: P,
): FieldsFromSchema<P> {
    return createFieldsProxy(ns);
}
