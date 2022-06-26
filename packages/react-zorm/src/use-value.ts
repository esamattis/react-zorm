import { RefObject, useEffect, useRef, useState } from "react";
import { isValuedElement } from "./utils";

export interface ValueSubscription<T> {
    name: string;
    zorm: {
        refObject: React.MutableRefObject<HTMLFormElement | undefined>;
    };
    initialValue?: T;
    event?: string;
    transform?: (value: string) => T;
}

export function useValue<T>(
    opts: ValueSubscription<T>,
): undefined extends T ? string : T {
    const [value, setValue] = useState<any>(opts.initialValue ?? "");
    const mapRef = useRef<((value: string) => T) | undefined>(opts.transform);

    useEffect(() => {
        const form = opts.zorm.refObject.current;
        if (!form) {
            return;
        }

        const listener = (e: { target: {} | null }) => {
            const input = e.target;

            if (!isValuedElement(input)) {
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
    }, [opts.name, opts.zorm.refObject, opts.event]);

    return value;
}

export function Value<T>(
    props: ValueSubscription<T> & {
        children: (value: undefined extends T ? string : T) => any;
    },
) {
    const value = useValue(props);
    return props.children(value);
}
