import "./styles.css";
import React from "react";
import { z } from "zod";
import { createCustomIssues, useZorm } from "react-zorm";
import { QueryClient, QueryClientProvider, useMutation } from "react-query";

const booleanCheckbox = () =>
    z
        .string()
        // Unchecked checkbox is just missing so it must be optional
        .optional()
        // Transform the value to boolean
        .transform(Boolean);

const SignupSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(5),
    terms: booleanCheckbox().refine((value) => value === true, {
        message: "You must agree!",
    }),
});

async function validateUsername(username: string) {
    // In real life this would make a POST call to a server where this code
    // would run.  But for this demo we run it inline
    await new Promise((r) => setTimeout(r, 1000));
    const issues = createCustomIssues(SignupSchema);

    if (username === "bob") {
        issues.username(`Username ${username} is already in use`);
    }

    return {
        issues: issues.toArray(),
    };
}

function Err(props: { children: string }) {
    return <div className="error">{props.children}</div>;
}

function ZormFormExample() {
    const usernameValidation = useMutation(validateUsername);

    const zo = useZorm("signup", SignupSchema, {
        customIssues: usernameValidation.data?.issues,
    });

    return (
        <div>
            <form method="post" ref={zo.ref}>
                <fieldset>
                    <legend>Signup</legend>
                    <div>
                        <i
                            style={{
                                display: "block",
                                padding: 5,
                                color: "gray",
                            }}
                        >
                            Try username "bob" to demonstrate async validation
                            error
                        </i>
                        Username:
                        <input
                            name={zo.fields.username()}
                            autoFocus
                            type="text"
                            onBlur={(e) => {
                                usernameValidation.mutate(e.target.value);
                            }}
                        />
                        {usernameValidation.isLoading ? (
                            <div style={{ color: "pink" }}>
                                Checking username...
                            </div>
                        ) : null}
                        {zo.errors.username((err) => (
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

                    <button>Signup!</button>
                </fieldset>
            </form>
        </div>
    );
}

const queryClient = new QueryClient();

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ZormFormExample />
        </QueryClientProvider>
    );
}
