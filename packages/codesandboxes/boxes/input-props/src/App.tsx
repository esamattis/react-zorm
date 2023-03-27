import "./styles.css";
import React from "react";
import { z } from "zod";
import { useZorm } from "react-zorm";
import { inputProps } from "./input-props";

const FormSchema = z.object({
    name: z.string().min(1),
    age: z.coerce.number().int().min(0).optional().default(18),
    email: z.string().email().optional(),
    date: z.date(),
    password: z
        .string()
        .min(10)
        .regex(/^[a-z0-9]+$/, "Passwords must match [a-z0-9]"),
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
            <>
                Name:
                <input
                    {...zo.fields.name(inputProps)}
                    className={zo.errors.name("errored")}
                />
                {zo.errors.name((e) => (
                    <ErrorMessage message={e.message} />
                ))}
                <pre>Props {pretty(zo.fields.name(inputProps))}</pre>
            </>

            <>
                email:
                <input
                    {...zo.fields.email(inputProps)}
                    className={zo.errors.email("errored")}
                />
                {zo.errors.email((e) => (
                    <ErrorMessage message={e.message} />
                ))}
                <pre>Props {pretty(zo.fields.email(inputProps))}</pre>
            </>

            <>
                date:
                <input
                    {...zo.fields.date(inputProps)}
                    className={zo.errors.date("errored")}
                />
                {zo.errors.date((e) => (
                    <ErrorMessage message={e.message} />
                ))}
                <pre>Props {pretty(zo.fields.date(inputProps))}</pre>
            </>

            <>
                Age:
                <input
                    {...zo.fields.age(inputProps)}
                    className={zo.errors.age("errored")}
                />
                {zo.errors.age((e) => (
                    <ErrorMessage message={e.message} />
                ))}
                <pre>Props {pretty(zo.fields.age(inputProps))}</pre>
            </>

            <>
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
            </>

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
