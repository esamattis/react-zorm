import { fieldChain } from "../src/chains";
import { z } from "zod";
import { assertNotAny } from "./test-helpers";
import { FieldChain, FieldGetter } from "../src/types";

test("can access the zod type", () => {
    const Schema = z.object({
        field: z.string(),
    });

    const chain = fieldChain("form", Schema, []);

    expect(chain.field((field) => field.type)).toBeInstanceOf(z.ZodString);
});

test("can access the zod type in nested object", () => {
    const Schema = z.object({
        nest: z.object({
            field: z.string(),
        }),
    });

    const chain = fieldChain("form", Schema, []);

    expect(chain.nest.field((field) => field.type)).toBeInstanceOf(z.ZodString);
});

test("can access the zod type in array", () => {
    const Schema = z.object({
        arr: z.array(z.string()),
    });

    const chain = fieldChain("form", Schema, []);

    expect(chain.arr(0)((field) => field.type)).toBeInstanceOf(z.ZodString);
});

test("can access the zod type in complex type", () => {
    const Schema = z.object({
        arr: z.array(
            z.object({
                deep: z.string(),
            }),
        ),
    });

    const chain = fieldChain("form", Schema, []);

    expect(chain.arr(0).deep((field) => field.type)).toBeInstanceOf(
        z.ZodString,
    );
});

test("can access wrapped types", () => {
    const Schema = z.object({
        field: z.number().nullish(),
    });

    const chain = fieldChain("form", Schema, []);

    // must return the wrapped type so users can detect nullish etc.
    expect(chain.field((field) => field.type)).toBeInstanceOf(z.ZodOptional);
});

test("can access access through optional objects", () => {
    const Schema = z.object({
        nest: z
            .object({
                field: z.string(),
            })
            .optional(),
    });

    const chain = fieldChain("form", Schema, []);

    expect(chain.nest.field((field) => field.type)).toBeInstanceOf(z.ZodString);
});

test("ZodEffects", () => {
    const Schema = z.object({
        field: z.number().refine((n) => n % 2 === 0, {
            message: "Must be even",
        }),
    });

    const chain = fieldChain("form", Schema, []);

    expect(chain.field((field) => field.type)).toBeInstanceOf(z.ZodEffects);
});

test("can read min-max", () => {
    const Schema = z.object({
        field: z.number().min(2).max(10),
    });

    const chain = fieldChain("form", Schema, []);

    const field = chain.field((field) => field.type);

    if (!(field instanceof z.ZodNumber)) {
        throw new Error("Expected ZodNumber");
    }

    expect(field._def.checks[0]).toMatchObject({
        kind: "min",
        value: 2,
    });

    expect(field._def.checks[1]).toMatchObject({
        kind: "max",
        value: 10,
    });
});

test("can read regex", () => {
    const Schema = z.object({
        field: z.string().regex(/^[a-z]+$/),
    });

    const chain = fieldChain("form", Schema, []);

    const field = chain.field((field) => field.type);

    if (!(field instanceof z.ZodString)) {
        throw new Error("Expected ZodString");
    }

    console.log(field._def.checks[0]);
    expect(field._def.checks[0]).toMatchObject({
        kind: "regex",
        regex: /^[a-z]+$/,
    });
});

test("can access the input name", () => {
    const Schema = z.object({
        arr: z.array(
            z.object({
                deep: z.string(),
            }),
        ),
    });

    const chain = fieldChain("form", Schema, []);

    expect(chain.arr(0).deep((field) => field.name)).toEqual("arr[0].deep");
});
