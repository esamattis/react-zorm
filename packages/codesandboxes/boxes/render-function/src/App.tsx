import "./styles.css";
import { z } from "zod";
import { RenderProps, useZorm } from "react-zorm";

const nameString = () =>
    z
        .string()
        .min(1)
        .max(10)
        .refine((s) => !s || s[0] === s[0].toUpperCase(), {
            message: "First letter must start with a capital letter",
        })
        .refine((s) => !s.includes(" "), {
            message: "Name must not contain spaces",
        });

const FormSchema = z.object({
    firstName: nameString(),
    lastName: nameString(),
});

function textField(props: RenderProps) {
    const hasError = props.issues.length > 0;
    return (
        <div>
            <input
                type="text"
                name={props.name}
                id={props.id}
                defaultValue="bad too long value"
                className={hasError ? "errored" : ""}
            />
            {props.issues.map((issue, i) => (
                <div key={i} className="error-message">
                    {issue.message}
                </div>
            ))}
        </div>
    );
}

export default function Form() {
    const zo = useZorm("render-function", FormSchema, {
        onValidSubmit(e) {
            e.preventDefault();
        },
    });

    return (
        <form
            method="post"
            ref={zo.ref}
            onSubmit={(e) => {
                e.preventDefault();
            }}
        >
            <h1>Resuable Render Functions</h1>

            <div>
                <h4>First Name</h4>
                {zo.fields.firstName(textField)}
            </div>

            <div>
                <h4>Last Name</h4>
                {zo.fields.lastName(textField)}
            </div>

            <button type="submit">Submit</button>
            <pre>Form result: {JSON.stringify(zo.validation, null, 2)}</pre>
        </form>
    );
}
