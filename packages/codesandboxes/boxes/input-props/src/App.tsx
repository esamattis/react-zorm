import "./styles.css";
import React from "react";
import { z } from "zod";
import { useZorm } from "react-zorm";
import { inputProps } from "./input-props";

const FormSchema = z.object({
    name: z.string().min(1),
    age: z.number().min(6).optional(),
    password: z
        .string()
        .min(10)
        .regex(/[a-z0-9]/, "Passwords must match [a-z0-9]"),
});

function ErrorMessage(props: { message: string }) {
    return <div className="error-message">{props.message}</div>;
}

export default function Signup() {
    const zo = useZorm("signup", FormSchema, {
        onValidSubmit(e) {
            e.preventDefault();
            alert("Form ok!\n" + pretty(e.data));
        },
    });
    const disabled = zo.validation?.success === false;

    return (
        <form ref={zo.ref}>
            Name:
            <input
                {...zo.fields.name(inputProps)}
                className={zo.errors.name("errored")}
            />
            {zo.errors.name((e) => (
                <ErrorMessage message={e.message} />
            ))}
            <pre>Props {pretty(zo.fields.name(inputProps))}</pre>
            Age:
            <input
                {...zo.fields.age(inputProps)}
                className={zo.errors.age("errored")}
            />
            {zo.errors.age((e) => (
                <ErrorMessage message={e.message} />
            ))}
            <pre>Props {pretty(zo.fields.age(inputProps))}</pre>
            Password:
            <input
                {...zo.fields.password(inputProps)}
                type="password"
                className={zo.errors.password("errored")}
            />
            {zo.errors.password((e) => (
                <ErrorMessage message={e.message} />
            ))}
            <pre>Props {pretty(zo.fields.password(inputProps))}</pre>
            <button disabled={disabled} type="submit">
                Signup!
            </button>
            <pre>Validation status: {pretty(zo.validation)}</pre>
        </form>
    );
}

function pretty(value: any) {
    return JSON.stringify(value, null, 2);
}
