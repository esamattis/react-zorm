import { z } from "zod";
import { assertIs, assertNotNil } from "@valu/assert";
import { errorChain } from "../src/chains";

test("can get error", () => {
    const Schema = z.object({
        field: z.string(),
    });

    const res = Schema.safeParse({});
    assertIs(res.success, false as const);

    const chain = errorChain<typeof Schema>(res.error.issues);

    expect(chain.field()).toEqual({
        code: "invalid_type",
        expected: "string",
        received: "undefined",
        path: ["field"],
        message: "Required",
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

    const chain = errorChain<typeof Schema>(res.error.issues);

    expect(chain.pw()).toEqual({
        code: "custom",
        message: "Passwords do not match",
        path: ["pw"],
    });
});

export function typeChecks() {
    {
        const Schema = z.object({
            list: z.array(z.string()),
        });

        const chain = errorChain<typeof Schema>(undefined);

        // @ts-expect-error
        chain.list();

        chain.list(0)();
    }
}
