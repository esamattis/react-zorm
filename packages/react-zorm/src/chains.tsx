import { RefObject } from "react";
import {
    GenericSchema,
    ErrorChainFromSchema,
    ErrorGetter,
    FieldChainFromSchema,
    GenericError,
    ValueChainFromSchema,
} from "./types";
import { isValuedElement } from "./utils";

function addArrayIndex(path: readonly string[], index: number) {
    const last = path[path.length - 1];
    return [...path.slice(0, -1), `${last}[${index}]`];
}

export function fieldChain<Schema extends GenericSchema>(
    ns: string,
    schema: Schema,
): FieldChainFromSchema<Schema> {
    return new Proxy(
        {},
        {
            get(_target, prop) {
                return _fieldChain(ns, [])[prop];
            },
        },
    ) as any;
}

function _fieldChain(ns: string, path: readonly string[]) {
    const proxy: any = new Proxy(() => {}, {
        apply(_target, _thisArg, args) {
            if (typeof args[0] === "number") {
                return _fieldChain(ns, addArrayIndex(path, args[0]));
            }

            if (args[0] === "id") {
                return ns + ":" + path.join(".");
            }

            return path.join(".");
        },

        get(_target, prop) {
            if (typeof prop === "string") {
                return _fieldChain(ns, [...path, prop]);
            }

            return _fieldChain(ns, path);
        },
    });

    return proxy;
}

export function valueChain<Schema extends GenericSchema>(
    form: RefObject<HTMLFormElement>,
    schema: Schema,
): ValueChainFromSchema<Schema> {
    return new Proxy(
        {},
        {
            get(_target, prop) {
                return _valueChain(form, [])[prop];
            },
        },
    ) as any;
}

function _valueChain(
    form: RefObject<HTMLFormElement>,
    path: readonly string[],
) {
    const proxy: any = new Proxy(() => {}, {
        apply(_target, _thisArg, args) {
            if (typeof args[0] === "number") {
                return _valueChain(form, addArrayIndex(path, args[0]));
            }

            const name = path.join(".");

            const input = form.current?.querySelector(`[name="${name}"]`);

            if (isValuedElement(input)) {
                return input.value ?? "";
            }

            return "";
        },

        get(_target, prop) {
            if (typeof prop === "string") {
                return _valueChain(form, [...path, prop]);
            }

            return _valueChain(form, path);
        },
    });

    return proxy;
}

export function errorChain<
    Schema extends GenericSchema,
    ChainError extends GenericError,
>(
    schema: Schema,
    error?: ChainError | undefined,
    _path?: readonly (string | number)[],
): ErrorChainFromSchema<Schema> & ErrorGetter<ChainError["issues"][0]> {
    let path = _path || [];
    const proxy: any = new Proxy(() => {}, {
        apply(_target, _thisArg, args) {
            if (typeof args[0] === "number") {
                return errorChain(schema, error, [...path, args[0]]);
            }

            const issue = error?.issues.find((issue) => {
                return arrayEquals(issue.path, path);
            });

            if (args[0] === Boolean) {
                return Boolean(issue);
            }

            if (typeof args[0] === "function") {
                if (issue) {
                    return args[0](issue);
                }

                return undefined;
            }

            if (args[0]) {
                if (issue) {
                    return args[0];
                } else {
                    return undefined;
                }
            }

            return issue || undefined;
        },

        get(_target, prop) {
            if (typeof prop === "string") {
                return errorChain(schema, error, [...path, prop]);
            }

            return errorChain(schema, error, path);
        },
    });

    return proxy;
}

function arrayEquals(a: readonly any[], b: readonly any[]) {
    return (
        a.length === b.length &&
        a.every((item, index) => {
            return item === b[index];
        })
    );
}
