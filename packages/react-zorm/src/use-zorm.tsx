import { useMemo, useRef, useState } from "react";
import type { ZodObject } from "zod";
import { errorChain, fieldChain } from "./chains";
import { safeParseForm } from "./parse-form";
import { SimpleSchema, Zorm } from "./types";

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
}

export function useZorm<Schema extends SimpleSchema>(
    formName: string,
    schema: Schema,
    options?: UseZormOptions<ReturnType<Schema["parse"]>>,
): Zorm<Schema> {
    type ValidationResult = ReturnType<Schema["safeParse"]>;

    const hasSubmittedOnce = useRef(false);
    const formRef = useRef<HTMLFormElement>(null);
    const submitRef = useRef<OnValidSubmit<ValidationResult> | undefined>(
        options?.onValidSubmit,
    );
    const [validation, setValidation] = useState<ValidationResult | null>(null);

    return useMemo(() => {
        const issues = !validation?.success
            ? validation?.error.issues
            : undefined;
        const errors = errorChain<Schema>(issues);
        const fields = fieldChain<Schema>(formName);

        const validate = () => {
            if (!formRef.current) {
                throw new Error("[react-zorm] ref not passed to the form");
            }

            const res = safeParseForm(schema, formRef.current);

            setValidation(res);

            return res;
        };

        return {
            ref: formRef,
            validate,
            validation,
            fields,
            errors,
            props(overrides) {
                return {
                    ref: formRef,
                    onSubmit(e) {
                        const res = validate();

                        if (res.success) {
                            if (!formRef.current) {
                                throw new Error(
                                    "[react-zorm] ref not passed to the form",
                                );
                            }

                            submitRef.current?.({
                                data: res.data,
                                preventDefault: () => {
                                    e.preventDefault();
                                },
                                target: formRef.current,
                            });
                        } else {
                            e.preventDefault();
                        }

                        hasSubmittedOnce.current = true;

                        return overrides?.onSubmit?.(e);
                    },
                    onBlur(e) {
                        if (hasSubmittedOnce.current) {
                            validate();
                        }
                        return overrides?.onBlur?.(e);
                    },
                };
            },
        };
    }, [formName, schema, validation]);
}
