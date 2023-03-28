import { useZorm } from "../src/index";
import { z } from "zod";
import React, { useEffect, useState } from "react";
import { registerTest } from "./register";

const Schema = z.object({
    input: z.string().min(1),
    extra: z.string().min(1),
});

function Test() {
    const [validFormData, setValidFormData] =
        useState<z.infer<typeof Schema>>();

    const zo = useZorm("form", Schema, {
        onValidSubmit(e) {
            e.preventDefault();
            setValidFormData(e.data);
        },
        onFormData(e) {
            e.formData.set(zo.fields.extra(), "extra data");
        },
    });

    return (
        <form ref={zo.ref} data-testid="form">
            <input data-testid="input" name={zo.fields.input()} />

            <button>submit with extra data</button>

            {zo.errors.input((e) => (
                <div className="error error-input">input: {e.code}</div>
            ))}

            {zo.errors.extra((e) => (
                <div className="error error-extra">extra: {e.code}</div>
            ))}

            {validFormData && (
                <div className="valid-data">
                    formdata: {validFormData.extra}
                </div>
            )}

            <pre>{JSON.stringify(validFormData, null, 2)}</pre>
        </form>
    );
}

registerTest("formdata-event", Test);
