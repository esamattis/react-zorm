import { setIn } from "./set-in";
import { SimpleSchema } from "./types";

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

    return ret;
}

export function parseForm<P extends SimpleSchema>(
    schema: P,
    form: HTMLFormElement | FormData,
): ReturnType<P["parse"]> {
    return schema.parse(parseFormAny(form));
}

export function safeParseForm<P extends SimpleSchema>(
    schema: P,
    form: HTMLFormElement | FormData,
): ReturnType<P["safeParse"]> {
    return schema.safeParse(parseFormAny(form));
}
