import { z, ZodIssue } from "zod";
import { assertIs } from "@valu/assert";
import { errorChain } from "../src/chains";
import { assertNotAny } from "./test-helpers";
import { ErrorChain, ErrorGetter } from "../src/types";

test("can get error", () => {
    const Schema = z.object({
        field: z.string(),
    });

    const res = Schema.safeParse({});
    assertIs(res.success, false as const);

    const chain = errorChain(Schema, res.error.issues);

    expect(chain.field()).toEqual({
        code: "invalid_type",
        expected: "string",
        received: "undefined",
        path: ["field"],
        message: "Required",
    });
});

test("can get boolean true on error", () => {
    const Schema = z.object({
        field: z.string(),
    });

    const res = Schema.safeParse({});
    assertIs(res.success, false as const);

    const chain = errorChain(Schema, res.error.issues);

    expect(chain.field(Boolean)).toBe(true);
});

test("can get boolean false on success", () => {
    const Schema = z.object({
        field: z.string(),
    });

    const chain = errorChain(Schema, []);

    expect(chain.field(Boolean)).toBe(false);
});

test("can use custom value", () => {
    const Schema = z.object({
        field: z.string(),
    });

    const res = Schema.safeParse({});
    assertIs(res.success, false as const);

    const chain = errorChain(Schema, res.error.issues);

    expect(chain.field({ my: "thing" })).toEqual({
        my: "thing",
    });
});

test("can use custom value in fn", () => {
    const Schema = z.object({
        field: z.string(),
    });

    const res = Schema.safeParse({});
    assertIs(res.success, false as const);

    const chain = errorChain(Schema, res.error.issues);

    expect(chain.field(() => ({ my: "thing" }))).toEqual({
        my: "thing",
    });
});

test("can get refined object error", () => {
    const Schema = z.object({
        pw: z
            .object({
                password: z.string(),
                password2: z.string(),
            })
            .refine(
                (val) => {
                    return val.password === val.password2;
                },
                { message: "Passwords do not match" },
            ),
    });

    const res = Schema.safeParse({
        pw: {
            password: "foo",
            password2: "bar",
        },
    });
    assertIs(res.success, false as const);

    const chain = errorChain(Schema, res.error.issues);

    expect(chain.pw()).toEqual({
        code: "custom",
        message: "Passwords do not match",
        path: ["pw"],
    });
});

export function typeChecks() {
    {
        const Schema = z.object({
            field: z.string(),
            list: z.array(z.string()),
            objectList: z.array(
                z.object({
                    nested: z.string(),
                }),
            ),
        });

        const chain = errorChain(Schema, []);

        const arrayIssue: ZodIssue | undefined = chain.list();
        assertNotAny(chain.list());
        chain.list()?.message;

        const itemIssue: ZodIssue | undefined = chain.list(0)();
        assertNotAny(chain.list(0)());

        const hmm: ErrorGetter = chain.list(0);
        assertNotAny(chain.list(0));

        {
            // Returns the number on normal field
            // @ts-expect-error
            const _: ErrorChain<any, any> = chain.field(3);
        }

        {
            // array index set returns the chain again
            const _: ErrorChain<any> = chain.objectList(3);
            assertNotAny(chain.objectList(3));
        }

        {
            const _: string | undefined = chain.field("");
            assertNotAny(chain.field(""));
        }

        {
            // has undefined
            // @ts-expect-error
            const _: string = chain.field("");
        }

        {
            const _: number | undefined = chain.field(3);
            assertNotAny(chain.field(3));
        }

        {
            // has undefined
            // @ts-expect-error
            const _: string = chain.field("");
        }

        {
            const _: number | undefined = chain.field(() => 3);
            assertNotAny(chain.field(() => 3));
        }

        {
            // has null
            // @ts-expect-error
            const _: number = chain.field(() => 3);
        }

        {
            const _: boolean = chain.field(Boolean);
            assertNotAny(chain.field(Boolean));
        }
    }
}

test("can handle optional fields", () => {
    const Schema = z.object({
        field: z.string().optional(),
    });

    const chain = errorChain(Schema, []);

    expect(chain.field()).toBeUndefined();
});

test("can handle nullish fields", () => {
    const Schema = z.object({
        field: z.string().nullish(),
    });

    const chain = errorChain(Schema, []);

    expect(chain.field()).toBeUndefined();
});

test("can handle optional arrrays", () => {
    const Schema = z.object({
        things: z
            .array(
                z.object({
                    field: z.string(),
                }),
            )
            .optional(),
    });

    const chain = errorChain(Schema, []);

    expect(chain.things(0).field()).toBeUndefined();
});
