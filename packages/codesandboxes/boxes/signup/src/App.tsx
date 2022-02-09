import "./styles.css";
import React from "react";
import { z } from "zod";
import { useZorm } from "react-zorm";

const FormSchema = z.object({
    name: z.string().min(1),
    age: z
        .string()
        .regex(/^[0-9]+$/)
        .transform(Number),
});

function ErrorMessage(props: { message: string }) {
    return <div className="error-message">{props.message}</div>;
}

export default function Signup() {
    const zo = useZorm("signup", FormSchema, {
        onValidSubmit(e) {
            e.preventDefault();
            alert("Form ok!\n" + JSON.stringify(e.data, null, 2));
        },
    });
    const disabled = zo.validation?.success === false;

    return (
        <form ref={zo.ref}>
            Name:
            <input
                type="text"
                name={zo.fields.name()}
                className={zo.errors.name("errored")}
            />
            {zo.errors.name((e) => (
                <ErrorMessage message={e.message} />
            ))}
            Age
            <input
                type="text"
                name={zo.fields.age()}
                className={zo.errors.age("errored")}
            />
            {zo.errors.age((e) => (
                <ErrorMessage message="Age must a number" />
            ))}
            <button disabled={disabled} type="submit">
                Signup!
            </button>
            <pre>
                Validation status: {JSON.stringify(zo.validation, null, 2)}
            </pre>
        </form>
    );
}
