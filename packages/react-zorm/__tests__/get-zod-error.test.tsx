import { assertIs } from "@valu/assert";
import { z, ZodIssue } from "zod";

test("basic nested object", () => {
    const FormValues = z.object({
        foo: z.string(),
        ob: z.object({
            thing: z.array(z.string().min(1)),
        }),
    });

    const validation = FormValues.safeParse({ ob: { thing: [""] } });

    assertIs(validation.success, false as const);
    console.log(validation.error.issues);
    const errors = createErrorProxy(validation.error.issues);
    console.log(validation.error.issues);

    console.log(
        errors.foo((error) => {
            return "error" + error.code;
        }),
    );

    console.log(
        errors.ob.thing(0)((error) => {
            return "error" + error.code;
        }),
    );
});
