import { useMemo, useRef, useState } from "react";
import type { ZodObject } from "zod";
import { errorChain, fieldChain } from "./chains";
import { safeParseForm } from "./parse-form";
import { SimpleSchema, Zorm } from "./types";

export function useZorm<Schema extends SimpleSchema>(
    formName: string,
    schema: Schema,
): Zorm<Schema> {
    type ValidationResult = ReturnType<Schema["safeParse"]>;

    const hasSubmittedOnce = useRef(false);
    const formRef = useRef<HTMLFormElement>(null);
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

                        if (!res.success) {
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
