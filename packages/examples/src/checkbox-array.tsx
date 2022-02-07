import React from "react";
import ReactDOM from "react-dom";
import { z } from "zod";
import { safeParseForm, useZorm } from "react-zorm";

interface Color {
    name: string;
    code: string;
}

const COLORS: Color[] = [
    {
        name: "Red",
        code: "red",
    },
    {
        name: "Green",
        code: "green",
    },
    {
        name: "Blue",
        code: "blue",
    },
];

const FormSchema = z.object({
    colors: z
        .array(z.string().nullish())
        .transform((a) => a.flatMap((item) => (item ? item : []))),
});

function ErrorMessage(props: { message: string }) {
    return <div className="error-message">{props.message}</div>;
}

function Signup() {
    const zo = useZorm("signup", FormSchema, {
        onValidSubmit(e) {
            e.preventDefault();
            alert("Form ok!");
        },
    });
    const canSubmit = !zo.validation || zo.validation?.success === true;

    return (
        <form
            ref={zo.ref}
            onSubmit={(e) => {
                console.log("ANY", safeParseForm(FormSchema, zo.ref.current!));
                e.preventDefault();
            }}
        >
            <p>Select at least 2 colors</p>

            {COLORS.map((color, index) => {
                return (
                    <div key={color.code}>
                        <input
                            type="checkbox"
                            id={zo.fields.colors(index)("id")}
                            name={zo.fields.colors(index)("name")}
                            defaultChecked={index === 1}
                            value={color.code}
                        />
                        <label htmlFor={zo.fields.colors(index)("id")}>
                            {color.name}
                        </label>
                    </div>
                );
            })}

            {zo.errors.colors((e) => (
                <ErrorMessage message={e.message} />
            ))}

            <button disabled={!canSubmit} type="submit">
                Signup!
            </button>
            <pre>
                Validation status: {JSON.stringify(zo.validation, null, 2)}
            </pre>
        </form>
    );
}

ReactDOM.render(<Signup />, document.getElementById("app"));
