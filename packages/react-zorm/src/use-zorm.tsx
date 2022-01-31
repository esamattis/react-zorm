import { useCallback, useRef, useState } from "react";
import { ZodObject, z } from "zod";
import { createErrorChain } from "./error-path-chain";
import { createFields, safeParseForm } from "./parse-form";
import { Zorm } from "./types";

export function useZorm<Schema extends ZodObject<any>>(
    formName: string,
    schema: Schema,
): Zorm<Schema> {
    type ValidationResult = ReturnType<Schema["safeParse"]>;

    const hasSubmittedOnce = useRef(false);
    const formRef = useRef<HTMLFormElement>(null);
    const [validation, setValidation] = useState<ValidationResult | null>(null);

    const validate = useCallback(() => {
        if (!formRef.current) {
            throw new Error(
                "[@valu/zod-form] Ref not passed to form correctly",
            );
        }

        const res = safeParseForm(schema, formRef.current);

        setValidation(res);

        return res;
    }, []);

    const issues = !validation?.success ? validation?.error.issues : undefined;
    const errors = createErrorChain(issues);
    const fields = createFields(formName, schema);

    return {
        ref: formRef,
        validate,
        validation,
        fields,
        errors,
        props(props) {
            return {
                ref: formRef,
                onSubmit(e) {
                    const res = validate();

                    if (!res.success) {
                        e.preventDefault();
                    }

                    hasSubmittedOnce.current = true;

                    return props?.onSubmit?.(e);
                },
                onBlur(e) {
                    if (hasSubmittedOnce.current) {
                        validate();
                    }
                    return props?.onBlur?.(e);
                },
            };
        },
    };
}
