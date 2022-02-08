import { RefObject, useEffect, useRef, useState } from "react";

export function useValue<T>(opts: {
    name: string;
    form: RefObject<HTMLFormElement>;
    initialValue?: T;
    event?: string;
    mapValue?: (value: string) => T;
}): undefined extends T ? string : T {
    const [value, setValue] = useState<any>(opts.initialValue ?? "");
    const mapRef = useRef<((value: string) => T) | undefined>(opts.mapValue);

    useEffect(() => {
        const form = opts.form.current;
        if (!form) {
            return;
        }

        const listener = (e: { target: {} | null }) => {
            const input = e.target;

            const isValuedInput =
                input instanceof HTMLInputElement ||
                input instanceof HTMLTextAreaElement;

            if (!isValuedInput) {
                return;
            }

            if (opts.name !== input.name) {
                return;
            }

            if (mapRef.current) {
                setValue(mapRef.current(input.value));
            } else {
                setValue(input.value ?? "");
            }
        };

        const initialInput = form.querySelector(`[name="${opts.name}"]`);

        if (initialInput) {
            listener({ target: initialInput });
        }

        const event = opts.event ?? "input";

        form.addEventListener(event, listener);
        return () => {
            form.removeEventListener(event, listener);
        };
    }, [opts.name, opts.form, opts.event]);

    return value;
}

export function Value<T>(props: {
    children: (value: undefined extends T ? string : T) => any;
    form: RefObject<HTMLFormElement>;
    name: string;
    event?: string;
    initialValue?: T;
    mapValue?: (value: string) => T;
}) {
    const value = useValue(props);
    return props.children(value);
}
