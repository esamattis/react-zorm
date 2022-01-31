/**
 * Deprecated prototype. This will be gone!
 */

import React, {
    useCallback,
    createContext,
    useContext,
    useRef,
    useState,
} from "react";
import { ZodObject } from "zod";
import { initErrorPathChain, initFieldPathChain } from "./chains";
import { safeParseForm } from "./parse-form";
import { ErrorFieldChain } from "./types";

const ValidationContext = createContext<any>(null);

export interface OverrideFormProps {
    onSubmit?(e: React.FormEvent<HTMLFormElement>): any;
    onBlur?(e: React.FormEvent<HTMLFormElement>): any;
}

/**
 * @deprecated
 */
export function createValidator<T extends ZodObject<any>>(
    ns: string,
    FormParser: T,
) {
    type ErrorsType = ErrorFieldChain<ReturnType<typeof FormParser["parse"]>>;
    type ValidationResult = ReturnType<T["safeParse"]>;

    return {
        fields: initFieldPathChain(ns),
        useValidationContext: () => {
            const context = useContext(ValidationContext);

            if (!context) {
                throw new Error("Could not find validation context");
            }
            return {
                errors: context.errors as ErrorsType,
                validation: context.validation as ValidationResult,
            };
        },
        useValidation() {
            const hasSubmittedOnce = useRef(false);
            const setContextValidation = useRef<any>(null);
            const formRef = useRef<HTMLFormElement>(null);

            const [validation, setValidation] =
                useState<ValidationResult | null>(null);

            const issues = !validation?.success
                ? validation?.error.issues
                : undefined;

            const validate = useCallback(() => {
                if (!formRef.current) {
                    throw new Error(
                        "[@valu/zod-form] Ref not passed to form correctly",
                    );
                }

                const res = safeParseForm(FormParser, formRef.current);

                setContextValidation?.current?.(res);
                setValidation(res);

                return res;
            }, []);

            const Context = useCallback((props: { children: any }) => {
                const [validation, setValidation] =
                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    useState<ValidationResult | null>(null);
                setContextValidation.current = setValidation;

                const issues = !validation?.success
                    ? validation?.error.issues
                    : undefined;

                const errors = initErrorPathChain(issues) as any as ErrorsType;
                return (
                    <ValidationContext.Provider value={{ errors, validation }}>
                        {props.children}
                    </ValidationContext.Provider>
                );
            }, []);

            const errors = initErrorPathChain(issues) as any as ErrorsType;

            return {
                errors,
                validation,
                validate,
                Context,
                props(props?: OverrideFormProps) {
                    const overriddes: OverrideFormProps = {
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

                    return {
                        ...props,
                        ...overriddes,
                        ref: formRef,
                    };
                },
            };
        },
    };
}
