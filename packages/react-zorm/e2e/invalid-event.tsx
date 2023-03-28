import { useZorm } from "../src/index";
import { z } from "zod";
import React, { useEffect, useState } from "react";
import { registerTest } from "./register";

const Schema = z.object({
    input: z.string().min(1),
});

function Test() {
    const zo = useZorm("form", Schema, {
        onValidSubmit(e) {
            e.preventDefault();
        },
    });

    return (
        <form ref={zo.ref} data-testid="form">
            <input data-testid="input" name={zo.fields.input()} required />

            <button>submit</button>

            {zo.errors.input((e) => (
                <div className="error error-input">input: {e.code}</div>
            ))}
        </form>
    );
}

registerTest("invalid-event", Test);
