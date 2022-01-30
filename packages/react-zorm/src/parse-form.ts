import { createFieldsProxy } from "./generate-path";
import { setIn } from "./set-in";

export interface ArrayGetter<T> {
    (type?: "id" | "name"): string;
    [key: string]: T;
}

export interface FieldGetter {
    (type?: "id" | "name"): string;
}

export type Fields<T extends object> = {
    [P in keyof T]: T[P] extends Array<any>
        ? (
              index: number,
          ) => Fields<T[P][0]> extends string ? FieldGetter : Fields<T[P][0]>
        : T[P] extends object
        ? Fields<T[P]>
        : FieldGetter;
};

/**
 * Something like Zod parser
 */
export interface Parser {
    parse: (arg: any) => any;
    safeParse: (arg: any) => any;
}

export type FieldsFromParser<T extends Parser> = Fields<ReturnType<T["parse"]>>;

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

export function parseForm<P extends Parser>(
    parser: P,
    form: HTMLFormElement | FormData,
): ReturnType<P["parse"]> {
    return parser.parse(parseFormAny(form));
}

export function safeParseForm<P extends Parser>(
    parser: P,
    form: HTMLFormElement | FormData,
): ReturnType<P["safeParse"]> {
    return parser.safeParse(parseFormAny(form));
}

export function createFields<P extends Parser>(
    ns: string,
    parser: P,
): FieldsFromParser<P> {
    return createFieldsProxy(ns);
}
