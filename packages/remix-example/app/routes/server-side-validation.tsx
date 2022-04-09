import type { ActionFunction } from "remix";
import { useTransition } from "remix";
import { useActionData } from "remix";
import { json } from "remix";
import { Form } from "remix";
import type { ZodIssue } from "zod";
import { z } from "zod";
import { useZorm, parseForm, createCustomIssues } from "react-zorm";

const booleanCheckbox = () =>
    z
        .string()
        // Unchecked checkbox is just missing so it must be optional
        .optional()
        // Transform the value to boolean
        .transform(Boolean);

const SignupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(5),
    terms: booleanCheckbox().refine((value) => value === true, {
        message: "You must agree!",
    }),
});

interface FormResponse {
    ok: boolean;
    issues?: ZodIssue[];
}

function Err(props: { children: string }) {
    return <div className="error">{props.children}</div>;
}

export const action: ActionFunction = async ({ request }) => {
    const form = await request.formData();
    const data = parseForm(SignupSchema, form);

    const issues = createCustomIssues(SignupSchema);

    console.log("Validating...");
    // Simulta slower database connection
    await new Promise((r) => setTimeout(r, 1000));

    // In reality you would make a real database check here or capture a
    // constraint error from user insertion
    if (data.email === "exists@test.invalid") {
        issues.email("Account already exists with " + data.email);
    }

    if (issues.hasIssues()) {
        return json<FormResponse>(
            { ok: false, issues: issues.getIssues() },
            { status: 400 },
        );
    }

    console.log("Form ok. Saving...");

    return json<FormResponse>({ ok: true });
};

export default function ZormFormExample() {
    const formResponse = useActionData<FormResponse>();
    const zo = useZorm("signup", SignupSchema, {
        customIssues: formResponse?.issues,
    });

    const transition = useTransition();
    const submitting = transition.state === "submitting";

    return (
        <div>
            <Form method="post" ref={zo.ref}>
                <fieldset>
                    <legend>Signup</legend>
                    <div>
                        Email:
                        <input
                            name={zo.fields.email()}
                            type="email"
                            defaultValue="exists@test.invalid"
                        />
                        {zo.errors.email((err) => (
                            <Err>{err.message}</Err>
                        ))}
                    </div>

                    <div>
                        Password:
                        <input
                            type="password"
                            name={zo.fields.password()}
                            defaultValue="hunter2"
                        ></input>
                        {zo.errors.password((err) => (
                            <Err>{err.message}</Err>
                        ))}
                    </div>

                    <div>
                        <input
                            type="checkbox"
                            name={zo.fields.terms()}
                            id={zo.fields.terms("id")}
                            defaultValue="1"
                        ></input>
                        <label htmlFor={zo.fields.terms("id")}>
                            I agree to stuff
                        </label>
                        {zo.errors.terms((err) => (
                            <Err>{err.message}</Err>
                        ))}
                    </div>

                    <button disabled={submitting}>
                        {submitting ? "Sending..." : "Signup!"}
                    </button>

                    {formResponse?.ok ? (
                        <div className="ok">User created!</div>
                    ) : null}
                </fieldset>
            </Form>
        </div>
    );
}
