import "./styles.css";
import React from "react";
import { z } from "zod";
import { useZorm } from "react-zorm";

const FormSchema = z.object({
    name: z.string().min(1),
    password: z
        .string()
        .min(10)
        .refine((pw) => /[0-9]/.test(pw), "Password must contain a number"),
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
            Password:
            <input
                type="password"
                name={zo.fields.password()}
                className={zo.errors.password("errored")}
            />
            {zo.errors.password((e) => (
                <ErrorMessage message={e.message} />
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
