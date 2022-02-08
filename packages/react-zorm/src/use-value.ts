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
        const input = opts.form.current?.querySelector(`[name="${opts.name}"]`);

        const isValuedInput =
            input instanceof HTMLInputElement ||
            input instanceof HTMLTextAreaElement;

        if (!isValuedInput) {
            return;
        }

        const listener = () => {
            if (mapRef.current) {
                setValue(mapRef.current(input.value));
            } else {
                setValue(input.value ?? "");
            }
        };

        listener();

        const event = opts.event ?? "input";

        input.addEventListener(event, listener);
        return () => {
            input.removeEventListener(event, listener);
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
