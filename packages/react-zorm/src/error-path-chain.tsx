import { ZodIssue } from "zod";

function createErroPathGenerator(
    issues: ZodIssue[] | undefined,
    path: readonly (string | number)[],
) {
    const proxy: any = new Proxy(() => {}, {
        apply(_target, _thisArg, args) {
            if (typeof args[0] === "number") {
                return createErroPathGenerator(issues, [...path, args[0]]);
            }

            const issue = issues?.find((issue) => {
                return arrayEquals(issue.path, path);
            });

            if (typeof args[0] === "function") {
                if (issue) {
                    return args[0](issue);
                }

                return null;
            }

            if (typeof args[0] === "string") {
                if (issue) {
                    return args[0];
                } else {
                    return undefined;
                }
            }

            return Boolean(issue);
        },

        get(_target, prop) {
            if (typeof prop === "string") {
                return createErroPathGenerator(issues, [...path, prop]);
            }

            return createErroPathGenerator(issues, path);
        },
    });

    return proxy;
}

export function createErrorChain(issues: ZodIssue[] | undefined): any {
    return new Proxy(
        {},
        {
            get(target, prop) {
                return createErroPathGenerator(issues, [])[prop];
            },
        },
    );
}

function arrayEquals(a: readonly any[], b: readonly any[]) {
    return (
        a.length === b.length &&
        a.every((item, index) => {
            return item === b[index];
        })
    );
}
