// This code is live at https://react-zorm.vercel.app/server-side-validation
import type { ActionFunction } from "remix";
import { Form, json } from "remix";
import { useTransition, useActionData } from "remix";
import type { ZodIssue } from "zod";
import { z } from "zod";
import { useZorm, parseForm, createCustomIssues } from "react-zorm";

/**
 * Handle checkbox as boolean
 */
const booleanCheckbox = () =>
    z
        .string()
        // Unchecked checkbox is just missing so it must be optional
        .optional()
        // Transform the value to boolean
        .transform(Boolean);

/**
 * The form schema
 */
const SignupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(5),
    terms: booleanCheckbox().refine((value) => value === true, {
        message: "You must agree!",
    }),
});

/**
 * Response type from the Remix Action Function
 */
interface FormResponse {
    /**
     * True when form was succesfully handled
     */
    ok: boolean;

    /**
     * Any server-side only issues
     */
    serverIssues?: ZodIssue[];
}

/**
 * The form route
 */
export default function ZormFormExample() {
    /**
     * The form response or undefined when the form is not submitted yet
     */
    const formResponse = useActionData<FormResponse>();

    const zo = useZorm("signup", SignupSchema, {
        // Pass server issues to Zorm as custom issues. Zorm will handle them
        // like any other Zod issues
        customIssues: formResponse?.serverIssues,
    });

    const submitting = useTransition().state === "submitting";

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
                            // This will render client-side errors as well as
                            // the server-side issues that where assigned to the
                            // "email" field
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
            <footer>
                The exists@test.invalid email is validated to be reserved on the
                server. Just submit the form the see it in action. Checkout the
                devtools network tab and the source of this{" "}
                <a href="https://github.com/esamattis/react-zorm/blob/master/packages/remix-example/app/routes/server-side-validation.tsx">
                    here
                </a>
                .
            </footer>
        </div>
    );
}

export const action: ActionFunction = async ({ request }) => {
    // Read the form data and parse it with Zorm's parseForm() helper
    const form = await request.formData();
    const data = parseForm(SignupSchema, form);

    const issues = createCustomIssues(SignupSchema);

    console.log("Validating...");
    // Simulate slower database/network connection
    await new Promise((r) => setTimeout(r, 1000));

    // In reality you would make a real database check here or capture a
    // constraint error from user insertion
    if (data.email === "exists@test.invalid") {
        // Add an issue the email field. This generates a ZodCustomIssue
        issues.email("Account already exists with " + data.email, {
            anything: "Any extra params you want to pass to ZodCustomIssue",
        });
    }

    // Respond with the issues if we have any
    if (issues.hasIssues()) {
        return json<FormResponse>(
            { ok: false, serverIssues: issues.toArray() },
            { status: 400 },
        );
    }

    console.log("Form ok. Saving...");

    return json<FormResponse>({ ok: true });
};

function Err(props: { children: string }) {
    return <div className="error">{props.children}</div>;
}
