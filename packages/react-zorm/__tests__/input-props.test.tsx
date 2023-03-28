import { z } from "zod";
import { unstable_inputProps as inputProps } from "../src";

test("sets type=text by default", () => {
    const props = inputProps({ name: "test", type: z.string() });
    expect(props).toEqual({ name: "test", type: "text", required: true });
});

// TODO more tests
