import "./styles.css";
import React, { useEffect, useState } from "react";
import { z } from "zod";
import { useZorm } from "react-zorm";
import Select from "react-select";

import { stateOptions } from "./data";

const FormSchema = z.object({
    states: z
        .array(
            z.object({
                code: z.string(),
            }),
        )
        .min(3),
});

export default function ReactSelectExample() {
    const zo = useZorm("3rdparty", FormSchema, {
        onValidSubmit(e) {
            e.preventDefault();
            alert(JSON.stringify(e.data, null, 2));
        },
        onFormData(e) {
            // Generate state data on the form:
            //
            //  [
            //      {code: ...},
            //      {code: ...},
            //  ]
            //
            values.forEach((value, index) => {
                // The same as hidden input:
                //   <input type="hidden" name={zo.fields.states(index).code()} value={value} />
                e.formData.set(zo.fields.states(index).code(), value);
            });
        },
    });

    // Helper state for react-select
    const [values, setValues] = useState<string[]>(["CT"]);

    const disabled = zo.validation?.success === false;

    return (
        <form ref={zo.ref}>
            Select at least 3 states:
            <Select
                isMulti
                defaultValue={stateOptions.filter((o) => o.value === "CT")}
                options={stateOptions}
                onBlur={() => {
                    zo.validate();
                }}
                onChange={(items) => {
                    setValues(items.map((item) => item.value));
                }}
            />
            <div style={{ color: "red" }}>{zo.errors.states()?.message}</div>
            <button disabled={disabled} type="submit">
                Submit!
            </button>
            <pre>
                Validation status: {JSON.stringify(zo.validation, null, 2)}
            </pre>
        </form>
    );
}
