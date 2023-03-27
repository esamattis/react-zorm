import { z } from "zod";

export interface InputProps {
    type: string;
    name: string;
    required?: boolean;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    [key: string]: any;
}

function removeZodEffects(type: z.ZodType): z.ZodType {
    // remove .refine() etc.
    if (type instanceof z.ZodEffects) {
        return removeZodEffects(type.innerType());
    }

    return type;
}

function stringCheckProps(type: z.ZodString) {
    const checks = type._def.checks;

    const props: Partial<InputProps> = {
        type: "text",
    };

    for (const check of checks) {
        if (check.kind === "min") {
            props.minLength = check.value;
        }

        if (check.kind === "max") {
            props.maxLength = check.value;
        }

        if (check.kind === "regex") {
            props.pattern = check.regex.toString().slice(1, -1);
        }

        // TODO the rest...
    }

    return props;
}

function numberCheckProps(type: z.ZodNumber) {
    const checks = type._def.checks;

    const props: Partial<InputProps> = {
        type: "number",
    };

    for (const check of checks) {
        if (check.kind === "min") {
            props.min = check.value;
        }

        if (check.kind === "max") {
            props.max = check.value;
        }

        // TODO the rest...
    }

    return props;
}

function collectProps(
    type: z.ZodType,
    _props: Partial<InputProps> = {},
): Partial<InputProps> {
    const props = _props ?? {};

    type = removeZodEffects(type);

    if (type instanceof z.ZodOptional) {
        props.required = false;
    }

    if (type instanceof z.ZodNullable) {
        props.required = false;
    }

    if (type instanceof z.ZodString) {
        Object.assign(props, stringCheckProps(type));
    }

    if (type instanceof z.ZodNumber) {
        Object.assign(props, numberCheckProps(type));
    }

    // Remove optional/nullable wrapping etc. There's probably a better way to do this.
    const anyType = type as any;
    if (anyType._def?.innerType) {
        return collectProps(anyType._def.innerType, props);
    }

    return props;
}

export function inputProps(field: {
    name: string;
    type: z.ZodType;
}): InputProps {
    const type = removeZodEffects(field.type);

    const props: InputProps = {
        type: "text",
        required: true,
        ...collectProps(type),
        name: field.name,
    };

    if (props.required === false) {
        delete props.required;
    }

    return props;
}
