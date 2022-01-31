import React from "react";
import ReactDOM from "react-dom";
import { z } from "zod";
import { useZorm } from "react-zorm";

const FormFields = z.object({
    email: z.string().refine(
        (val) => {
            return val.includes("@") && val.includes(".");
        },
        { message: "Email must contain a @ sign and a dot" },
    ),
    password: z.string().min(8),
});

function ErrorMessage(props: { message: string }) {
    return <div className="error-message">{props.message}</div>;
}

function Signup() {
    const zo = useZorm("signup", FormFields);
    const canSubmit = !zo.validation || zo.validation?.success === true;

    return (
        <form
            {...zo.props({
                onSubmit(e) {
                    e.preventDefault();
                    if (zo.validation?.success) {
                        alert("Form ok!");
                    }
                },
            })}
        >
            <br />
            Email: <br />
            <input
                type="text"
                name={zo.fields.email()}
                className={zo.errors.email("errored")}
            />
            {zo.errors.email((e) => (
                <ErrorMessage message={e.message} />
            ))}
            <br />
            Password: <br />
            <input
                type="password"
                name={zo.fields.password()}
                className={zo.errors.password("errored")}
            />
            {zo.errors.password((e) => (
                <ErrorMessage message={e.message} />
            ))}
            <div>
                <button disabled={!canSubmit} type="submit">
                    Signup!
                </button>
            </div>
            <pre>
                Validation status: {JSON.stringify(zo.validation, null, 2)}
            </pre>
        </form>
    );
}

ReactDOM.render(<Signup />, document.getElementById("app"));
