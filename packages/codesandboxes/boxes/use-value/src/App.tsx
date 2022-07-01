import "./styles.css";
import React from "react";
import { z } from "zod";
import { VisualizeRenders } from "./helpers";
import { useZorm, useValue, Value, Zorm } from "react-zorm";

const FormSchema = z.object({
    input1: z.string().min(1),
    input2: z.string().min(1),
    input3: z.string().min(1),
    input4: z.string().min(1),
});

function Subcomponent(props: { zo: Zorm<typeof FormSchema> }) {
    const value = useValue({
        zorm: props.zo,
        name: props.zo.fields.input4(),
    });
    return (
        <VisualizeRenders>
            Input4 {"<Subcomponent>"}: {value}
        </VisualizeRenders>
    );
}

export default function Form() {
    const zo = useZorm("signup", FormSchema, {
        onValidSubmit(e) {
            e.preventDefault();
            alert("Form ok!\n" + JSON.stringify(e.data, null, 2));
        },
    });
    const disabled = zo.validation?.success === false;
    const input2Value = useValue({ zorm: zo, name: zo.fields.input2() });

    return (
        <VisualizeRenders>
            <form ref={zo.ref}>
                Input1 (not read)
                <input
                    type="text"
                    name={zo.fields.input1()}
                    className={zo.errors.input1("errored")}
                />
                Input2 useValue()
                <input
                    type="text"
                    name={zo.fields.input2()}
                    className={zo.errors.input2("errored")}
                />
                Input3 {"<Value>"}
                <input
                    type="text"
                    name={zo.fields.input3()}
                    className={zo.errors.input3("errored")}
                />
                Input4 {"<Subcomponent>"}
                <input
                    type="text"
                    name={zo.fields.input4()}
                    className={zo.errors.input4("errored")}
                />
                <VisualizeRenders>
                    Input2 useValue(): {input2Value}
                </VisualizeRenders>
                <Value zorm={zo} name={zo.fields.input3()}>
                    {(value) => (
                        <VisualizeRenders>
                            Input3 {"<Value>"}: {value}
                        </VisualizeRenders>
                    )}
                </Value>
                <Subcomponent zo={zo} />
                <button disabled={disabled} type="submit">
                    Submit
                </button>
                <pre>
                    Validation status: {JSON.stringify(zo.validation, null, 2)}
                </pre>
            </form>
        </VisualizeRenders>
    );
}
