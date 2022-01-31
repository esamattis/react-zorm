import type { ZodIssue, ZodObject } from "zod";

export interface ArrayIndexSetter<T> {
    (type?: "id" | "name"): string;
    [key: string]: T;
}

export interface FieldGetter {
    (type?: "id" | "name"): string;
}

export type FieldChain<T extends object> = {
    [P in keyof T]: T[P] extends Array<any>
        ? (
              index: number,
          ) => FieldChain<T[P][0]> extends string
              ? FieldGetter
              : FieldChain<T[P][0]>
        : T[P] extends object
        ? FieldChain<T[P]>
        : FieldGetter;
};

/**
 * Something like Zod schema
 */
export interface SimpleSchema {
    parse: (arg: any) => any;
    safeParse: (arg: any) => any;
}

export type FieldsFromSchema<T extends SimpleSchema> = FieldChain<
    ReturnType<T["parse"]>
>;

export interface ErrorRender {
    (): boolean;
    (className: string): string;
    (render: (issue: ZodIssue) => any): any;
}

export type ErrorFieldChain<T extends object> = {
    [P in keyof T]: T[P] extends Array<any>
        ? (
              index: number,
          ) => ErrorFieldChain<T[P][0]> extends string
              ? ErrorRender
              : ErrorFieldChain<T[P][0]>
        : T[P] extends object
        ? ErrorFieldChain<T[P]>
        : ErrorRender;
};

export type ErrorFieldsFromSchema<T extends SimpleSchema> = ErrorFieldChain<
    ReturnType<T["parse"]>
>;

export interface OverrideFormProps {
    onSubmit?(e: React.FormEvent<HTMLFormElement>): any;
    onBlur?(e: React.FormEvent<HTMLFormElement>): any;
}

type SchemaToObject<Schema extends SimpleSchema> = ReturnType<Schema["parse"]>;

export interface Zorm<Schema extends ZodObject<any>> {
    ref: React.RefObject<HTMLFormElement>;
    props(override?: OverrideFormProps): {
        ref: React.RefObject<HTMLFormElement>;
    } & OverrideFormProps;
    fields: FieldChain<SchemaToObject<Schema>>;
    errors: ErrorFieldChain<SchemaToObject<Schema>>;
    validate(): ReturnType<Schema["safeParse"]>;
    validation: ReturnType<Schema["safeParse"]> | null;
}
