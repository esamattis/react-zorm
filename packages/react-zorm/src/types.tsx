import type { ZodIssue, ZodObject } from "zod";

/**
 * Something like Zod schema
 */
export interface SimpleSchema {
    parse: (arg: any) => any;
    safeParse: (arg: any) => any;
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

export type FieldChainFromSchema<T extends SimpleSchema> = FieldChain<
    ReturnType<T["parse"]>
>;

export interface ErrorGetter {
    /**
     * Get the Zod Issue
     */
    (): ZodIssue | undefined;

    /**
     * Return true when there is an error
     */
    (bool: typeof Boolean): boolean;

    /**
     * Call the function on error and return its value
     */
    <Fn extends (error: ZodIssue) => any>(render: Fn):
        | ReturnType<Fn>
        | undefined;

    /**
     * Return the given value on error
     */
    <T>(value: T): T | undefined;
}

export interface ArrayErrorGetter<T> extends ErrorGetter {
    (index: number): T;
}

export type ErrorChain<T extends object> = {
    [P in keyof T]: T[P] extends Array<any>
        ? ArrayErrorGetter<
              ErrorChain<T[P][0]> extends string
                  ? ErrorGetter
                  : ErrorChain<T[P][0]> & ErrorGetter
          >
        : T[P] extends object
        ? ErrorChain<T[P]> & ErrorGetter
        : ErrorGetter;
};

export type ErrorChainFromSchema<T extends SimpleSchema> = ErrorChain<
    ReturnType<T["parse"]>
>;

export interface OverrideFormProps {
    onSubmit?(e: React.FormEvent<HTMLFormElement>): any;
    onBlur?(e: React.FormEvent<HTMLFormElement>): any;
}

export type SchemaToObject<Schema extends SimpleSchema> = ReturnType<
    Schema["parse"]
>;

export type SafeParseResult<Schema extends SimpleSchema> = ReturnType<
    Schema["safeParse"]
>;

export interface Zorm<Schema extends SimpleSchema> {
    ref: React.RefObject<HTMLFormElement>;
    props(override?: OverrideFormProps): {
        ref: React.RefObject<HTMLFormElement>;
    } & OverrideFormProps;
    fields: FieldChain<SchemaToObject<Schema>>;
    errors: ErrorChain<SchemaToObject<Schema>> & ErrorGetter;
    validate(): SafeParseResult<Schema>;
    validation: SafeParseResult<Schema> | null;
}
