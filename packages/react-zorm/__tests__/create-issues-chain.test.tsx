import { z } from "zod";
import { assertIs, assertNotNil } from "@valu/assert";
import { createCustomIssues } from "../src/chains";
import { assertNotAny } from "./test-helpers";

test("single field", () => {
    const Schema = z.object({
        field: z.string(),
    });

    const chain = createCustomIssues(Schema);

    expect(chain.field("custom server error")).toEqual({
        code: "custom",
        message: "custom server error",
        params: {},
        path: ["field"],
    });
});

test("mutates inner state", () => {
    const Schema = z.object({
        field: z.string(),
    });

    const chain = createCustomIssues(Schema);

    expect(chain.toArray()).toEqual([]);
    expect(chain.hasIssues()).toBe(false);

    chain.field("custom server error");

    expect(chain.hasIssues()).toBe(true);
    expect(chain.toArray()).toEqual([
        {
            code: "custom",
            message: "custom server error",
            params: {},
            path: ["field"],
        },
    ]);
});

test("nested field", () => {
    const Schema = z.object({
        field: z.object({
            nested: z.string(),
        }),
    });

    const chain = createCustomIssues(Schema);

    expect(chain.field.nested("custom server error")).toEqual({
        code: "custom",
        message: "custom server error",
        params: {},
        path: ["field", "nested"],
    });
});

test("error on object", () => {
    const Schema = z.object({
        field: z.object({
            nested: z.string(),
        }),
    });

    const chain = createCustomIssues(Schema);

    expect(chain.field("custom server error on object")).toEqual({
        code: "custom",
        message: "custom server error on object",
        params: {},
        path: ["field"],
    });
});

test("error on nested object in array", () => {
    const Schema = z.object({
        field: z.object({
            nestedArray: z.array(
                z.object({
                    deep: z.string(),
                }),
            ),
        }),
    });

    const chain = createCustomIssues(Schema);

    expect(chain.field.nestedArray("custom server error on array")).toEqual({
        code: "custom",
        message: "custom server error on array",
        params: {},
        path: ["field", "nestedArray"],
    });
});

test("error on array item", () => {
    const Schema = z.object({
        field: z.object({
            array: z.array(z.string()),
        }),
    });

    const chain = createCustomIssues(Schema);

    expect(chain.field.array(3)("error")).toEqual({
        code: "custom",
        message: "error",
        params: {},
        path: ["field", "array", 3],
    });
});

test("nested array fields", () => {
    const Schema = z.object({
        field: z.object({
            nestedArray: z.array(
                z.object({
                    deep: z.string(),
                }),
            ),
        }),
    });

    const chain = createCustomIssues(Schema);

    expect(chain.field.nestedArray(3).deep("custom server error")).toEqual({
        code: "custom",
        message: "custom server error",
        params: {},
        path: ["field", "nestedArray", 3, "deep"],
    });
});

test("can convert to json", () => {
    const Schema = z.object({
        field: z.string(),
    });

    const chain = createCustomIssues(Schema);

    chain.field("error");

    expect(chain.toJSON()).toEqual([
        {
            code: "custom",
            message: "error",
            params: {},
            path: ["field"],
        },
    ]);

    expect(chain.toArray()).toEqual([
        {
            code: "custom",
            message: "error",
            params: {},
            path: ["field"],
        },
    ]);

    expect(JSON.stringify(chain)).toEqual(
        '[{"code":"custom","path":["field"],"message":"error","params":{}}]',
    );
});

test("can toJSON() multiple issues", () => {
    const Schema = z.object({
        field: z.object({
            nested: z.string(),
        }),
    });

    const chain = createCustomIssues(Schema);

    chain.field("error1");
    chain.field.nested("error2");

    expect(chain.toJSON()).toEqual([
        {
            code: "custom",
            message: "error1",
            params: {},
            path: ["field"],
        },
        {
            code: "custom",
            message: "error2",
            params: {},
            path: ["field", "nested"],
        },
    ]);
});

/**
 * Type tests
 */
(function () {
    const Schema = z.object({
        field: z.object({
            nestedArray: z.array(
                z.object({
                    deep: z.string(),
                }),
            ),
        }),
    });

    const chain = createCustomIssues(Schema);

    // .toJSON() is only at the top level
    chain.toJSON();
    // @ts-expect-error
    chain.field.toJSON();

    // @ts-expect-error
    chain.bad;

    assertNotAny(chain);

    assertNotAny(chain.field.nestedArray(3).deep("custom server error"));

    // @ts-expect-error
    chain.field(/bad/);

    // returns the issue and not the chain
    // @ts-expect-error
    chain.field.nestedArray("array error").deep("should not work");

    {
        const issue = chain.field.nestedArray("array error");
        assertNotAny(issue);
        issue.message;
    }

    {
        const issue = chain.field.nestedArray(3)("array error");
        assertNotAny(issue);
        issue.message;
    }
});
