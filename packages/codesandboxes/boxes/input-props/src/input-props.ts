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
    step?: string | number;
    defaultValue?: string | number;
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

        if (check.kind === "email") {
            props.type = "email";
        }

        // TODO the rest...
    }

    return props;
}

function numberCheckProps(type: z.ZodNumber) {
    const checks = type._def.checks;

    const props: Partial<InputProps> = {
        type: "number",
        step: "any",
    };

    for (const check of checks) {
        if (check.kind === "min") {
            props.min = check.value;
        }

        if (check.kind === "max") {
            props.max = check.value;
        }

        if (check.kind === "int" && props.step === "any") {
            // defaults to 1 so we can remove it if limited to ints
            delete props.step;
        }

        if (check.kind === "multipleOf") {
            props.step = check.value;
        }

        // TODO the rest...
    }

    return props;
}

function dateCheckProps(type: z.ZodDate) {
    const checks = type._def.checks;

    const props: Partial<InputProps> = {
        type: "date",
    };

    for (const check of checks) {
        if (check.kind === "min") {
            props.min = check.value;
        }

        if (check.kind === "max") {
            props.max = check.value;
        }
    }

    return props;
}

function collectProps(
    type: z.ZodType,
    _props: Partial<InputProps> = {},
): Partial<InputProps> {
    const props = _props ?? {};

    type = removeZodEffects(type);

    if (type instanceof z.ZodDefault) {
        props.defaultValue = type._def.defaultValue();
    } else if (type instanceof z.ZodOptional || type instanceof z.ZodNullable) {
        props.required = false;
    } else if (type instanceof z.ZodString) {
        Object.assign(props, stringCheckProps(type));
    } else if (type instanceof z.ZodNumber) {
        Object.assign(props, numberCheckProps(type));
    } else if (type instanceof z.ZodDate) {
        Object.assign(props, dateCheckProps(type));
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
    if (field.name === "age") {
        console.log(field.type);
    }

    const props: InputProps = {
        type: "text",
        required: true,
        ...collectProps(field.type),
        name: field.name,
    };

    if (props.required === false) {
        delete props.required;
    }

    return props;
}
