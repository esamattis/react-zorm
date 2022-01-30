import React from "react";
import ReactDOM from "react-dom";
import { z } from "zod";
import { createValidator } from "react-zorm";

const FormValues = z.object({
    email: z.string().refine(
        (val) => {
            return val.includes("@") && val.includes(".");
        },
        { message: "Email must contain a @ sign and a dot" },
    ),
    password: z.string().min(8),
});

const { useValidation, fields } = createValidator("signup", FormValues);

function ErrorMessage(props: { message: string }) {
    return <div className="error-message">{props.message}</div>;
}

function Signup() {
    const { validation, props, errors } = useValidation();
    const canSubmit = !validation || validation?.success === true;

    return (
        <form
            {...props({
                onSubmit(e) {
                    e.preventDefault();
                    if (validation?.success) {
                        alert("Form ok!");
                    }
                },
            })}
        >
            <br />
            Email: <br />
            <input
                type="text"
                name={fields.email()}
                className={errors.email("errored")}
            />
            {errors.email((e) => (
                <ErrorMessage message={e.message} />
            ))}
            <br />
            Password: <br />
            <input
                type="password"
                name={fields.password()}
                className={errors.password("errored")}
            />
            {errors.password((e) => (
                <ErrorMessage message={e.message} />
            ))}
            <div>
                <button disabled={!canSubmit} type="submit">
                    Signup!
                </button>
            </div>
            <pre>Validation status: {JSON.stringify(validation, null, 2)}</pre>
        </form>
    );
}

ReactDOM.render(<Signup />, document.getElementById("app"));
