function createPathGenerator(ns: string, path: readonly string[]) {
    const proxy: any = new Proxy(() => {}, {
        apply(_target, _thisArg, args) {
            if (typeof args[0] === "number") {
                const last = path[path.length - 1];

                return createPathGenerator(ns, [
                    ...path.slice(0, -1),
                    `${last}[${args[0]}]`,
                ]);
            }

            if (args[0] === "id") {
                return ns + ":" + path.join(".");
            }

            return path.join(".");
        },

        get(_target, prop) {
            if (typeof prop === "string") {
                return createPathGenerator(ns, [...path, prop]);
            }

            return createPathGenerator(ns, path);
        },
    });

    return proxy;
}

export function createFieldsProxy(ns: string): any {
    return new Proxy(
        {},
        {
            get(target, prop) {
                return createPathGenerator(ns, [])[prop];
            },
        },
    );
}
