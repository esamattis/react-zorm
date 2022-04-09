import type { ZodCustomIssue, ZodIssue, ZodType } from "zod";

type Primitive = string | number | boolean | bigint | symbol | undefined | null;

export type DeepNonNullable<T> = T extends Primitive
    ? NonNullable<T>
    : T extends {}
    ? { [K in keyof T]-?: DeepNonNullable<T[K]> }
    : Required<T>;

export interface ZormError {
    issues: ZodIssue[];
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

export type ErrorChainFromSchema<T extends GenericSchema> = ErrorChain<
    DeepNonNullable<ReturnType<T["parse"]>>
>;

export type SafeParseResult<Schema extends GenericSchema> = ReturnType<
    ZodType<Schema>["safeParse"]
>;

export interface Zorm<Schema extends GenericSchema> {
    ref: React.RefObject<HTMLFormElement>;
    fields: FieldChainFromSchema<Schema>;
    errors: ErrorChainFromSchema<Schema> & ErrorGetter;
    validate(): SafeParseResult<Schema>;
    validation: SafeParseResult<Schema> | null;
    customIssues: ZodIssue[];
}

/**
 * Create ZodCustomIssue for the field in the chain path
 */
export interface IssueCreator {
    (
        message: string,
        params?: {
            [key: string]: any;
        },
    ): ZodCustomIssue;
}

export interface ArrayIssueCreator<T> extends IssueCreator {
    (index: number): T;
}

export type IssueCreatorChain<T extends object> = {
    [P in keyof T]: T[P] extends Array<any>
        ? ArrayIssueCreator<
              IssueCreatorChain<T[P][0]> extends string
                  ? IssueCreator
                  : IssueCreatorChain<T[P][0]> & IssueCreator
          >
        : T[P] extends object
        ? IssueCreatorChain<T[P]> & IssueCreator
        : IssueCreator;
};

export type ZodCustomIssueWithMessage = ZodCustomIssue & { message: string };

export interface IssueCreatorMethods {
    hasIssues(): boolean;
    toArray(): ZodCustomIssueWithMessage[];
    // For direct JSON.stringify(chain) support
    toJSON(): ZodCustomIssueWithMessage[];
}

export type IssueCreatorFromSchema<T extends GenericSchema> = IssueCreatorChain<
    DeepNonNullable<ReturnType<T["parse"]>>
> &
    IssueCreatorMethods;
