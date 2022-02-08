import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ZodType } from "zod";
import { errorChain, fieldChain, valueChain } from "./chains";
import { safeParseForm } from "./parse-form";
import { Zorm } from "./types";

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

export function useZorm<Schema extends ZodType<any>>(
    formName: string,
    schema: Schema,
    options?: UseZormOptions<ReturnType<Schema["parse"]>>,
): Zorm<Schema> {
    type ValidationResult = ReturnType<Schema["safeParse"]>;

    const formRef = useRef<HTMLFormElement>(null);
    const submittedOnceRef = useRef(false);
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
        const res = safeParseForm(schema, getForm());
        setValidation(res);
        return res;
    }, [getForm, schema]);

    useEffect(() => {
        const form = formRef.current;
        if (!form) {
            return;
        }

        if (options?.setupListeners === false) {
            return;
        }

        const submitHandler = (e: { preventDefault(): any }) => {
            submittedOnceRef.current = true;
            const validation = validate();

            if (!validation.success) {
                e.preventDefault();
            } else {
                submitRef.current?.({
                    data: validation.data,
                    target: getForm(),
                    preventDefault: () => {
                        e.preventDefault();
                    },
                });
            }
        };

        const changeHandler = () => {
            if (!submittedOnceRef.current) {
                return;
            }

            validate();
        };

        form.addEventListener("change", changeHandler);
        form.addEventListener("submit", submitHandler);

        return () => {
            form.removeEventListener("change", changeHandler);
            form.removeEventListener("submit", submitHandler);
        };
    }, [getForm, options?.setupListeners, validate]);

    return useMemo(() => {
        const error = !validation?.success ? validation?.error : undefined;

        const errors = errorChain(schema, error);
        const fields = fieldChain(formName, schema);
        const values = valueChain(formRef, schema);

        return {
            ref: formRef,
            validate,
            validation,
            fields,
            errors,
            values,
        };
    }, [formName, schema, validate, validation]);
}
