import "./styles.css";
import React, { useState } from "react";
import { z } from "zod";
import { useZorm } from "react-zorm";
import Select from "react-select";

import { stateOptions } from "./data";

function SelectState(props: {
    defaultStates: string[];
    getName: (index: number) => string;
    onBlur?: () => any;
}) {
    const [values, setValues] = useState<string[] | null>(null);

    const defaulValues = props.defaultStates.map((value) => {
        return {
            label: stateOptions.find((o) => o.value === value)?.label,
            value,
        };
    });

    const syncValues: string[] = values ?? props.defaultStates;

    return (
        <>
            <Select
                isMulti
                defaultValue={defaulValues}
                options={stateOptions}
                onBlur={props.onBlur}
                onChange={(items) => {
                    setValues(items.map((item) => item.value));
                }}
            />
            {syncValues.map((value, index) => {
                return (
                    <input
                        key={index}
                        type="hidden"
                        name={props.getName(index)}
                        value={value}
                    />
                );
            })}
        </>
    );
}

const FormSchema = z.object({
    states: z.array(z.string()).min(3),
});

export default function ReactSelectExample() {
    const zo = useZorm("3rdparty", FormSchema, {
        onValidSubmit(e) {
            e.preventDefault();
            alert(JSON.stringify(e.data, null, 2));
        },
    });
    const disabled = zo.validation?.success === false;

    return (
        <form ref={zo.ref}>
            Select at least 3 states:
            <SelectState
                onBlur={() => {
                    zo.validate();
                }}
                defaultStates={[stateOptions[30].value]}
                getName={(index) => zo.fields.states(index)("name")}
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
