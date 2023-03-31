import { z } from "zod";
import { unstable_inputProps as inputProps } from "../src";

test("sets type=text by default", () => {
    const props = inputProps({
        id: "form:test",
        name: "test",
        type: z.string(),
        issues: [],
    });

    expect(props).toEqual({
        name: "test",
        type: "text",
        required: true,
    });
});

test("sets aria-invalid when there is issues", () => {
    const props = inputProps({
        name: "test",
        type: z.string(),
        id: "form:test",
        issues: [
            {
                code: "custom",
                message: "custom error",
                path: ["test"],
            },
        ],
    });
    expect(props).toEqual({
        name: "test",
        type: "text",
        required: true,
        "aria-invalid": true,
        "aria-errormessage": "error:form:test",
    });
});

// TODO more tests
