import { useZorm } from "../src/index";
import { z } from "zod";
import React from "react";
import { registerTest } from "./register";

const Schema = z.object({
    thing: z.string().min(5),
});

function Test() {
    const zo = useZorm("form", Schema);

    return (
        <form ref={zo.ref} data-testid="form">
            <input data-testid="input" name={zo.fields.thing()} />

            {zo.errors.thing(() => (
                <div className="error">error</div>
            ))}
        </form>
    );
}

registerTest("validate-on-blur", Test);
