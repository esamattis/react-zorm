import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { errorChain, fieldChain } from "./chains";
import { safeParseForm } from "./parse-form";
import { GenericSchema, SafeParseResult, Zorm } from "./types";

export interface ValidSubmitEvent<Data> {
    /**
     * Prevent the default form submission
     */
    preventDefault(): void;

    /**
     * The form HTML Element
     */
    target: HTMLFormElement;

    /**
     * Zod validated and parsed data
     */
    data: Data;
}

export interface UseZormOptions<Data> {
    /**
     * Called when the form is submitted with valid data
     */
    onValidSubmit?: (event: ValidSubmitEvent<Data>) => any;

    setupListeners?: boolean;
}

export interface FormListener {
    getForm(): HTMLFormElement;
    validate(): SafeParseResult<any>;
    onValidSubmit(event: ValidSubmitEvent<any>): any;
    _isSubmittedOnce?: boolean;
}

/**
 * Setup form listeners on the document element
 */
function setupFormListener() {
    const listeners = new Set<FormListener>();

    if (typeof document !== undefined) {
        document.addEventListener("change", (e) => {
            const el = e.target;
            if (!(el instanceof HTMLElement)) {
                return;
            }
            listeners.forEach((listener) => {
                if (
                    listener._isSubmittedOnce &&
                    listener.getForm().contains(el)
                ) {
                    listener.validate();
                }
            });
        });

        document.addEventListener("submit", (e) => {
            const form = e.target;
            if (!(form instanceof HTMLFormElement)) {
                return;
            }

            listeners.forEach((listener) => {
                if (listener.getForm() === e.target) {
                    listener._isSubmittedOnce = true;
                    const res = listener.validate();
                    if (res.success) {
                        listener.onValidSubmit({
                            data: res.data,
                            preventDefault: () => e.preventDefault(),
                            target: form,
                        });
                    } else {
                        e.preventDefault();
                    }
                }
            });
        });
    }

    return {
        listen(listener: FormListener) {
            listeners.add(listener);

            return () => {
                listeners.delete(listener);
            };
        },
    };
}

const forms = setupFormListener();

export function useZorm<Schema extends GenericSchema>(
    formName: string,
    schema: Schema,
    options?: UseZormOptions<ReturnType<Schema["parse"]>>,
): Zorm<Schema> {
    type ValidationResult = ReturnType<Schema["safeParse"]>;

    const formRef = useRef<HTMLFormElement>(null);
    const submitRef = useRef<
        UseZormOptions<ValidationResult>["onValidSubmit"] | undefined
    >(options?.onValidSubmit);

    const [validation, setValidation] = useState<ValidationResult | null>(null);

    const getForm = useCallback(() => {
        if (!formRef.current) {
            throw new Error("[react-zorm]: Form ref not passed");
        }
        return formRef.current;
    }, []);

    const validate = useCallback(() => {
        const res = safeParseForm(getForm(), schema);
        setValidation(res);
        return res;
    }, [getForm, schema]);

    useEffect(() => {
        if (options?.setupListeners === false) {
            return;
        }

        return forms.listen({
            getForm,
            validate,
            onValidSubmit: (e) => {
                submitRef.current?.(e);
            },
        });
    }, [getForm, options?.setupListeners, validate]);

    return useMemo(() => {
        const error = !validation?.success ? validation?.error : undefined;

        const errors = errorChain(schema, error);
        const fields = fieldChain(formName, schema);

        return {
            ref: formRef,
            validate,
            validation,
            fields,
            errors,
        };
    }, [formName, schema, validate, validation]);
}
