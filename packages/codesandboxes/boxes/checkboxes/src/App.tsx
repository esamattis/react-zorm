import "./styles.css";
import React from "react";
import { z } from "zod";
import { useZorm } from "react-zorm";
import { COLORS } from "./colors";

/**
 * Helper Zod type to convert checkbox values to booleans
 */
const booleanCheckbox = () =>
    z
        .string()
        // Unchecked checkbox is just missing so it must be optional
        .optional()
        // Transform the value to boolean
        .transform(Boolean);

const arrayCheckbox = () =>
    z
        .array(z.string().nullish())
        .nullish()
        // Remove all nulls to ensure string[]
        .transform((a) => (a ?? []).flatMap((item) => (item ? item : [])));
// Why .flatMap() and not .filter():
// https://twitter.com/esamatti/status/1485718780508618758

const FormSchema = z.object({
    colors: arrayCheckbox().refine(
        (colors) => {
            return colors.length > 2;
        },
        { message: "Select at least 3 colors" },
    ),

    acceptTerms: booleanCheckbox().refine(
        (val) => {
            return val === true;
        },
        { message: "You must accept the terms" },
    ),
    allowSpam: booleanCheckbox(),
});

function ErrorMessage(props: { message: string }) {
    return <div className="error-message">{props.message}</div>;
}

export default function SelectColors() {
    const zo = useZorm("signup", FormSchema, {
        onValidSubmit(e) {
            e.preventDefault();
            alert("Form ok!\n" + JSON.stringify(e.data, null, 2));
        },
    });
    const disabled = zo.validation?.success === false;

    return (
        <form ref={zo.ref}>
            <h1>Checkboxes!</h1>
            <fieldset>
                <legend>Select at least 2 colors</legend>

                {COLORS.map((color, index) => {
                    return (
                        <div key={color.code}>
                            <input
                                type="checkbox"
                                id={zo.fields.colors(index)("id")}
                                name={zo.fields.colors(index)("name")}
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
            </fieldset>

            <fieldset>
                <legend>Misc</legend>

                <input
                    type="checkbox"
                    id={zo.fields.acceptTerms("id")}
                    name={zo.fields.acceptTerms()}
                />
                <label htmlFor={zo.fields.acceptTerms("id")}>
                    Accept terms*
                </label>
                {zo.errors.acceptTerms((e) => (
                    <ErrorMessage message={e.message} />
                ))}

                <br />
                <input
                    type="checkbox"
                    id={zo.fields.allowSpam("id")}
                    name={zo.fields.allowSpam()}
                />
                <label htmlFor={zo.fields.allowSpam("id")}>
                    Send me some spam!
                </label>
            </fieldset>

            <button disabled={disabled} type="submit">
                Submit
            </button>
            <pre>
                Validation status: {JSON.stringify(zo.validation, null, 2)}
            </pre>
        </form>
    );
}
