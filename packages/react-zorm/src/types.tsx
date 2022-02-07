import type { ZodIssue, ZodType } from "zod";

type Primitive = string | number | boolean | bigint | symbol | undefined | null;

export type DeepNonNullable<T> = T extends Primitive
    ? NonNullable<T>
    : T extends {}
    ? { [K in keyof T]-?: DeepNonNullable<T[K]> }
    : Required<T>;

export interface GenericIssue {
    path: (string | number)[];
}

export interface GenericError {
    issues: GenericIssue[];
}

/**
 * Something like Zod schema
 */
export interface GenericSchema {
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

export type FieldChainFromSchema<T extends GenericSchema> = FieldChain<
    DeepNonNullable<ReturnType<T["parse"]>>
>;

export interface ErrorGetter<Issue extends GenericIssue> {
    /**
     * Get the Zod Issue
     */
    (): Issue | undefined;

    /**
     * Return true when there is an error
     */
    (bool: typeof Boolean): boolean;

    /**
     * Call the function on error and return its value
     */
    <Fn extends (error: Issue) => any>(render: Fn): ReturnType<Fn> | undefined;

    /**
     * Return the given value on error
     */
    <T>(value: T): T | undefined;
}

export interface ArrayErrorGetter<T, Issue extends GenericIssue>
    extends ErrorGetter<Issue> {
    (index: number): T;
}

export type ErrorChain<T extends object, Issue extends GenericIssue> = {
    [P in keyof T]: T[P] extends Array<any>
        ? ArrayErrorGetter<
              ErrorChain<T[P][0], Issue> extends string
                  ? ErrorGetter<Issue>
                  : ErrorChain<T[P][0], Issue> & ErrorGetter<Issue>,
              Issue
          >
        : T[P] extends object
        ? ErrorChain<T[P], Issue> & ErrorGetter<Issue>
        : ErrorGetter<Issue>;
};

export type ErrorChainFromSchema<T extends GenericSchema> = ErrorChain<
    DeepNonNullable<ReturnType<T["parse"]>>,
    ZodIssue
>;

export type SchemaToObject<Schema extends GenericSchema> = ReturnType<
    Schema["parse"]
>;

export type SafeParseResult<Schema extends GenericSchema> = ReturnType<
    ZodType<Schema>["safeParse"]
>;

export interface Zorm<Schema extends GenericSchema> {
    ref: React.RefObject<HTMLFormElement>;
    fields: FieldChain<SchemaToObject<Schema>>;
    errors: ErrorChain<SchemaToObject<Schema>, ZodIssue> &
        ErrorGetter<ZodIssue>;
    validate(): SafeParseResult<Schema>;
    validation: SafeParseResult<Schema> | null;
}
