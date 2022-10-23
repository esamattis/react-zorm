import "./styles.css";
import React from "react";
import { z } from "zod";
import { useZorm } from "react-zorm";
import { useTranslations } from "./i18n";

const FormSchema = z.object({
    language: z.union([z.literal("en"), z.literal("fi")]),
    name: z.string().min(1),
    password: z
        .string()
        .min(8)
        .refine(
            (s) => {
                return /[0-9]/.test(s);
            },
            {
                message: "Password must at least contain one number",
                params: {
                    code: "number_missing",
                },
            },
        ),
});

function ErrorMessage(props: { message: string }) {
    return <div className="error-message">{props.message}</div>;
}

export default function Signup() {
    const [lang, setLang] = React.useState<"en" | "fi">("en");
    const t = useTranslations(lang);

    const zo = useZorm("signup", FormSchema, {
        onValidSubmit(e) {
            e.preventDefault();
            alert("Form ok!\n" + JSON.stringify(e.data, null, 2));
        },
    });
    const disabled = zo.validation?.success === false;

    return (
        <form ref={zo.ref}>
            {t.language()}
            <label>
                <input
                    onChange={() => setLang("en")}
                    type="radio"
                    name={zo.fields.language()}
                    value="en"
                    defaultChecked
                />
                In English
            </label>

            <label>
                <input
                    type="radio"
                    onChange={() => setLang("fi")}
                    name={zo.fields.language()}
                    value="fi"
                />
                Suomeksi
            </label>

            <hr />

            {t.name()}
            <input
                type="text"
                name={zo.fields.name()}
                className={zo.errors.name("errored")}
            />
            {zo.errors.name((e) => {
                return <ErrorMessage message={t.badUsername(e)} />;
            })}
            {t.password()}
            <input
                type="text"
                name={zo.fields.password()}
                className={zo.errors.password("errored")}
            />
            {zo.errors.password((e) => {
                return <ErrorMessage message={t.badPassword(e)} />;
            })}
            <button disabled={disabled} type="submit">
                {t.signup()}
            </button>
            <pre>
                {t.validationStatus()} {JSON.stringify(zo.validation, null, 2)}
            </pre>
        </form>
    );
}
