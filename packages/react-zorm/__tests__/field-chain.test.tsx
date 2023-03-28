import { fieldChain } from "../src/chains";
import { z } from "zod";
import { assertNotAny } from "./test-helpers";
import { FieldChain, FieldGetter } from "../src/types";

test("basic", () => {
    const Schema = z.object({
        field: z.string(),
    });

    const chain = fieldChain("form", Schema, []);

    expect(chain.field()).toEqual("field");
    expect(chain.field("name")).toEqual("field");
    expect(chain.field("id")).toEqual("form:field");

    {
        const res: string = chain.field();
        assertNotAny(chain.field());
    }
    {
        const res: string = chain.field("id");
        assertNotAny(chain.field("id"));
    }
    {
        const res: string = chain.field("name");
        assertNotAny(chain.field("name"));
    }

    () => {
        // @ts-expect-error
        chain.bad();

        // @ts-expect-error
        chain.field("crap");
    };
});

test("nested object", () => {
    const Schema = z.object({
        ob: z.object({
            field: z.string(),
        }),
    });

    const chain = fieldChain("form", Schema, []);

    expect(chain.ob.field()).toEqual("ob.field");
    expect(chain.ob.field("name")).toEqual("ob.field");
    expect(chain.ob.field("id")).toEqual("form:ob.field");

    {
        const res: string = chain.ob.field();
        assertNotAny(chain.ob.field());
    }
    {
        const res: string = chain.ob.field("id");
        assertNotAny(chain.ob.field("id"));
    }
    {
        const res: string = chain.ob.field("name");
        assertNotAny(chain.ob.field("name"));
    }

    () => {
        // @ts-expect-error
        chain.ob.bad();

        // @ts-expect-error
        chain.ob.field("crap");
    };
});

test("array of strings", () => {
    const Schema = z.object({
        things: z.array(z.string()),
    });

    const chain = fieldChain("form", Schema, []);

    expect(chain.things(0)()).toEqual("things[0]");
    expect(chain.things(0)("name")).toEqual("things[0]");
    expect(chain.things(0)("id")).toEqual("form:things[0]");

    {
        const res: string = chain.things(0)();
        assertNotAny(chain.things(0)());
    }
    {
        const res: string = chain.things(0)("id");
        assertNotAny(chain.things(0)("id"));
    }
    {
        const res: string = chain.things(0)("name");
        assertNotAny(chain.things(0)("name"));
    }

    () => {
        // @ts-expect-error
        chain.things();
        // @ts-expect-error
        chain.things("id");
        // @ts-expect-error
        chain.things("name");

        {
            const res: FieldGetter = chain.things(0);
            assertNotAny(chain.things(0));
        }
    };
});

test("array of objects", () => {
    const Schema = z.object({
        things: z.array(
            z.object({
                ding: z.string(),
            }),
        ),
    });

    const chain = fieldChain("form", Schema, []);

    expect(chain.things(0).ding()).toEqual("things[0].ding");
    expect(chain.things(0).ding("name")).toEqual("things[0].ding");
    expect(chain.things(0).ding("id")).toEqual("form:things[0].ding");

    {
        const res: string = chain.things(0).ding();
        assertNotAny(chain.things(0).ding());
    }
    {
        const res: string = chain.things(0).ding("id");
        assertNotAny(chain.things(0).ding("id"));
    }
    {
        const res: string = chain.things(0).ding("name");
        assertNotAny(chain.things(0).ding("name"));
    }

    () => {
        // @ts-expect-error
        chain.things();
        // @ts-expect-error
        chain.things("id");
        // @ts-expect-error
        chain.things("name");

        {
            const res: FieldChain<any> = chain.things(0);
            assertNotAny(chain.things(0));
        }
    };
});

test("optional fields", () => {
    const Schema = z.object({
        field: z.string().optional(),
    });

    const chain = fieldChain("form", Schema, []);

    expect(chain.field()).toEqual("field");
    expect(chain.field("name")).toEqual("field");
    expect(chain.field("id")).toEqual("form:field");

    {
        const res: string = chain.field();
        assertNotAny(chain.field());
    }
    {
        const res: string = chain.field("id");
        assertNotAny(chain.field("id"));
    }
    {
        const res: string = chain.field("name");
        assertNotAny(chain.field("name"));
    }

    () => {
        // @ts-expect-error
        chain.bad();

        // @ts-expect-error
        chain.field("crap");
    };
});

test("nullable fields", () => {
    const Schema = z.object({
        field: z.string().nullable(),
    });

    const chain = fieldChain("form", Schema, []);

    expect(chain.field()).toEqual("field");
    expect(chain.field("name")).toEqual("field");
    expect(chain.field("id")).toEqual("form:field");

    {
        const res: string = chain.field();
        assertNotAny(chain.field());
    }
    {
        const res: string = chain.field("id");
        assertNotAny(chain.field("id"));
    }
    {
        const res: string = chain.field("name");
        assertNotAny(chain.field("name"));
    }

    () => {
        // @ts-expect-error
        chain.bad();

        // @ts-expect-error
        chain.field("crap");
    };
});

test("nullish fields", () => {
    const Schema = z.object({
        field: z.string().nullish(),
    });

    const chain = fieldChain("form", Schema, []);

    expect(chain.field()).toEqual("field");
    expect(chain.field("name")).toEqual("field");
    expect(chain.field("id")).toEqual("form:field");

    {
        const res: string = chain.field();
        assertNotAny(chain.field());
    }
    {
        const res: string = chain.field("id");
        assertNotAny(chain.field("id"));
    }
    {
        const res: string = chain.field("name");
        assertNotAny(chain.field("name"));
    }

    () => {
        // @ts-expect-error
        chain.bad();

        // @ts-expect-error
        chain.field("crap");
    };
});

test("optional arrays", () => {
    const Schema = z.object({
        things: z.array(z.object({ ding: z.string() })).optional(),
    });

    const chain = fieldChain("form", Schema, []);

    expect(chain.things(0).ding("name")).toEqual("things[0].ding");
});

test("nullish arrays", () => {
    const Schema = z.object({
        things: z.array(z.object({ ding: z.string() })).nullish(),
    });

    const chain = fieldChain("form", Schema, []);

    expect(chain.things(0).ding("name")).toEqual("things[0].ding");
});

test("nullable arrays", () => {
    const Schema = z.object({
        things: z.array(z.object({ ding: z.string() })).nullable(),
    });

    const chain = fieldChain("form", Schema, []);

    expect(chain.things(0).ding("name")).toEqual("things[0].ding");
});

test("nullable array items", () => {
    const Schema = z.object({
        things: z.array(z.object({ ding: z.string() }).nullable()),
    });

    const chain = fieldChain("form", Schema, []);

    expect(chain.things(0).ding("name")).toEqual("things[0].ding");
});

test("nullish array items", () => {
    const Schema = z.object({
        things: z.array(z.object({ ding: z.string() }).nullish()),
    });

    const chain = fieldChain("form", Schema, []);

    expect(chain.things(0).ding("name")).toEqual("things[0].ding");
});

test("date field", () => {
    const Schema = z.object({
        ding: z.string(),
        date: z.date(),
    });

    const chain = fieldChain("form", Schema, []);

    expect(chain.date()).toEqual("date");

    // @ts-expect-error
    const _notAny: number = chain.date();
});
