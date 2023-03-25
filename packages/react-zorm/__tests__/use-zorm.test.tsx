import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import React, { useState } from "react";
import { z, ZodIssue } from "zod";

import { useZorm } from "../src";
import { assertNotAny } from "./test-helpers";
import { createCustomIssues } from "../src/chains";

/**
 * For https://github.com/testing-library/user-event/pull/1109
 */
class WorkaroundFormData extends FormData {
    #formRef?: HTMLFormElement;
    constructor(...args: ConstructorParameters<typeof FormData>) {
        super(...args);
        this.#formRef = args[0];
    }

    // React Zorm only uses entries() so this is the only method we need to patch
    override *entries() {
        for (const [name, value] of super.entries()) {
            const entry: [string, FormDataEntryValue] = [name, value];

            if (value instanceof File && this.#formRef) {
                const input = this.#formRef.querySelector(
                    `input[name="${name}"]`,
                );

                if (input instanceof HTMLInputElement) {
                    const realFile = input?.files?.[0];
                    if (realFile) {
                        entry[1] = realFile;
                    }
                }
            }

            yield entry;
        }
    }
}

const OrigFormData = globalThis.FormData;

beforeAll(() => {
    globalThis.FormData = WorkaroundFormData;
});

afterAll(() => {
    globalThis.FormData = OrigFormData;
});

test("single field validation", () => {
    const Schema = z.object({
        thing: z.string().min(1),
    });

    function Test() {
        const zo = useZorm("form", Schema);

        return (
            <form ref={zo.ref} data-testid="form">
                <input name={zo.fields.thing()} />

                {zo.errors.thing((e) => (
                    <div data-testid="error">{e.code}</div>
                ))}
            </form>
        );
    }

    render(<Test />);

    fireEvent.submit(screen.getByTestId("form"));

    expect(screen.queryByTestId("error")).toHaveTextContent("too_small");
});

test("first blur does not trigger error", () => {
    const Schema = z.object({
        thing: z.string().min(1),
    });

    function Test() {
        const zo = useZorm("form", Schema);

        return (
            <form ref={zo.ref} data-testid="form">
                <input data-testid="input" name={zo.fields.thing()} />

                {zo.errors.thing() ? (
                    <div data-testid="error">error</div>
                ) : (
                    <div data-testid="ok">ok</div>
                )}
            </form>
        );
    }

    render(<Test />);

    fireEvent.blur(screen.getByTestId("input"));

    expect(screen.queryByTestId("ok")).toHaveTextContent("ok");
});

test("form is validated on blur after the first submit", async () => {
    const Schema = z.object({
        thing: z.string().min(1),
    });

    function Test() {
        const zo = useZorm("form", Schema);

        return (
            <form ref={zo.ref} data-testid="form">
                <input data-testid="input" name={zo.fields.thing()} />

                {zo.errors.thing() ? (
                    <div data-testid="error">error</div>
                ) : (
                    <div data-testid="ok">ok</div>
                )}
            </form>
        );
    }

    render(<Test />);

    fireEvent.submit(screen.getByTestId("form"));
    expect(screen.queryByTestId("error")).toHaveTextContent("error");

    await userEvent.type(screen.getByTestId("input"), "content");
    fireEvent.blur(screen.getByTestId("input"));

    expect(screen.queryByTestId("ok")).toHaveTextContent("ok");
});

test("form data is validated", async () => {
    const Schema = z.object({
        thing: z.string().min(1),
    });

    const spy = jest.fn();

    function Test() {
        const zo = useZorm("form", Schema);

        if (zo.validation?.success) {
            spy(zo.validation.data);
        }

        return (
            <form ref={zo.ref} data-testid="form">
                <input data-testid="input" name={zo.fields.thing()} />
            </form>
        );
    }

    render(<Test />);

    await userEvent.type(screen.getByTestId("input"), "content");
    fireEvent.submit(screen.getByTestId("form"));

    expect(spy).toHaveBeenCalledWith({ thing: "content" });
});

test("class name shortcut", () => {
    const Schema = z.object({
        thing: z.string().min(1),
    });

    function Test() {
        const zo = useZorm("form", Schema);

        return (
            <form ref={zo.ref} data-testid="form">
                <input
                    data-testid="input"
                    name={zo.fields.thing()}
                    className={zo.errors.thing("errored")}
                />
            </form>
        );
    }

    render(<Test />);

    expect(screen.queryByTestId("input")).not.toHaveClass("errored");

    fireEvent.submit(screen.getByTestId("form"));

    expect(screen.queryByTestId("input")).toHaveClass("errored");
});

test("can get the validation object", () => {
    const Schema = z.object({
        thing: z.string().min(1),
    });

    function Test() {
        const zo = useZorm("form", Schema);

        return (
            <form ref={zo.ref} data-testid="form">
                <input name={zo.fields.thing()} />

                <div data-testid="error">{zo.errors.thing()?.code}</div>
            </form>
        );
    }

    render(<Test />);

    fireEvent.submit(screen.getByTestId("form"));

    expect(screen.queryByTestId("error")).toHaveTextContent("too_small");
});

test("can validate multiple dependent fields", async () => {
    const Schema = z.object({
        password: z
            .object({
                pw1: z.string(),
                pw2: z.string(),
            })
            .refine(
                (pw) => {
                    return pw.pw1 === pw.pw2;
                },
                { message: "passwords to not match" },
            ),
    });

    function Test() {
        const zo = useZorm("form", Schema);

        return (
            <form ref={zo.ref} data-testid="form">
                <input
                    name={zo.fields.password.pw1()}
                    data-testid={zo.fields.password.pw1("id")}
                />
                <input
                    name={zo.fields.password.pw2()}
                    data-testid={zo.fields.password.pw2("id")}
                />

                <div data-testid="error">{zo.errors.password()?.message}</div>
            </form>
        );
    }

    render(<Test />);

    await userEvent.type(screen.getByTestId("form:password.pw1"), "foo");
    await userEvent.type(screen.getByTestId("form:password.pw2"), "bar");
    fireEvent.submit(screen.getByTestId("form"));

    expect(screen.queryByTestId("error")).toHaveTextContent(
        "passwords to not match",
    );
});

test("can validate multiple dependent root fields", async () => {
    const Schema = z
        .object({
            pw1: z.string(),
            pw2: z.string(),
        })
        .refine(
            (pw) => {
                return pw.pw1 === pw.pw2;
            },
            { message: "passwords to not match" },
        );

    function Test() {
        const zo = useZorm("form", Schema);

        return (
            <form ref={zo.ref} data-testid="form">
                <input
                    name={zo.fields.pw1()}
                    data-testid={zo.fields.pw1("id")}
                />

                <input
                    name={zo.fields.pw2()}
                    data-testid={zo.fields.pw2("id")}
                />

                <div data-testid="error">{zo.errors()?.message}</div>
            </form>
        );
    }

    render(<Test />);

    await userEvent.type(screen.getByTestId("form:pw1"), "foo");
    await userEvent.type(screen.getByTestId("form:pw2"), "bar");
    fireEvent.submit(screen.getByTestId("form"));

    expect(screen.queryByTestId("error")).toHaveTextContent(
        "passwords to not match",
    );
});

test("can parse array of strings", () => {
    const Schema = z.object({
        strings: z.array(z.string().min(2)),
    });

    const spy = jest.fn();

    function Test() {
        const zo = useZorm("form", Schema);

        if (zo.validation?.success) {
            spy(zo.validation.data);
        }

        return (
            <form ref={zo.ref} data-testid="form">
                <input
                    name={zo.fields.strings(0)("name")}
                    defaultValue="ding"
                />
                <input
                    name={zo.fields.strings(1)("name")}
                    defaultValue="dong"
                />
            </form>
        );
    }

    render(<Test />);

    fireEvent.submit(screen.getByTestId("form"));

    expect(spy).toHaveBeenCalledWith({ strings: ["ding", "dong"] });
});

test("can validate array of strings on individual items", () => {
    const Schema = z.object({
        strings: z.array(z.string().min(2)),
    });

    function Test() {
        const zo = useZorm("form", Schema);

        return (
            <form ref={zo.ref} data-testid="form">
                <input
                    name={zo.fields.strings(0)("name")}
                    defaultValue="ding"
                />
                <input name={zo.fields.strings(1)("name")} defaultValue="d" />
                <div data-testid="error">{zo.errors.strings(1)()?.message}</div>
            </form>
        );
    }

    render(<Test />);

    fireEvent.submit(screen.getByTestId("form"));

    expect(screen.queryByTestId("error")).toHaveTextContent(
        "String must contain at least 2 character(s)",
    );
});

test("can validate array of strings", () => {
    const Schema = z.object({
        strings: z.array(z.string()).min(2),
    });

    function Test() {
        const zo = useZorm("form", Schema);

        return (
            <form ref={zo.ref} data-testid="form">
                <input
                    name={zo.fields.strings(0)("name")}
                    defaultValue="ding"
                />
                <div data-testid="error">{zo.errors.strings()?.message}</div>
            </form>
        );
    }

    render(<Test />);

    fireEvent.submit(screen.getByTestId("form"));

    expect(screen.queryByTestId("error")).toHaveTextContent(
        "Array must contain at least 2 element(s",
    );
});

test("onOnValidSubmit is called on first valid submit", async () => {
    const spy = jest.fn();

    const Schema = z.object({
        thing: z.string().min(1),
    });

    function Test() {
        const zo = useZorm("form", Schema, {
            onValidSubmit(e) {
                spy(e.data);
            },
        });

        return (
            <form ref={zo.ref} data-testid="form">
                <input data-testid="input" name={zo.fields.thing()} />
            </form>
        );
    }

    render(<Test />);

    await userEvent.type(screen.getByTestId("input"), "content");
    fireEvent.submit(screen.getByTestId("form"));
    expect(spy).toHaveBeenCalledWith({ thing: "content" });
});

test("onOnValidSubmit is not called on error submit", async () => {
    const spy = jest.fn();

    const Schema = z.object({
        thing: z.string().min(10),
    });

    function Test() {
        const zo = useZorm("form", Schema, {
            onValidSubmit(e) {
                assertNotAny(e.data);
                assertNotAny(e.data.thing);
                const val: string = e.data.thing;

                // @ts-expect-error
                e.data.bad;

                spy();
            },
        });

        return (
            <form ref={zo.ref} data-testid="form">
                <input data-testid="input" name={zo.fields.thing()} />
            </form>
        );
    }

    render(<Test />);

    await userEvent.type(screen.getByTestId("input"), "short");
    fireEvent.submit(screen.getByTestId("form"));
    expect(spy).toHaveBeenCalledTimes(0);

    await userEvent.type(
        screen.getByTestId("input"),
        "looooooooooooooooooooooong",
    );
    fireEvent.submit(screen.getByTestId("form"));
    expect(spy).toHaveBeenCalledTimes(1);
});

test("setupListeners: false", async () => {
    const spy = jest.fn();

    const Schema = z.object({
        thing: z.string().min(10),
    });

    function Test() {
        const zo = useZorm("form", Schema, {
            setupListeners: false,
            onValidSubmit() {
                spy();
            },
        });

        return (
            <form ref={zo.ref} data-testid="form">
                <input data-testid="input" name={zo.fields.thing()} />
                <div data-testid="status">
                    {zo.errors.thing() ? "error" : "ok"}
                </div>
            </form>
        );
    }

    render(<Test />);

    // Does not update ok status to error because no listeners
    await userEvent.type(screen.getByTestId("input"), "short");
    fireEvent.submit(screen.getByTestId("form"));
    expect(spy).toHaveBeenCalledTimes(0);
    expect(screen.getByTestId("status")).toHaveTextContent("ok");

    // No change here
    await userEvent.type(
        screen.getByTestId("input"),
        "looooooooooooooooooooooong",
    );
    fireEvent.blur(screen.getByTestId("input"));
    expect(screen.getByTestId("status")).toHaveTextContent("ok");

    // Or here
    fireEvent.submit(screen.getByTestId("form"));
    expect(spy).toHaveBeenCalledTimes(0);
});

test("checkbox arrays", async () => {
    const spy = jest.fn();
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

    function Test() {
        const zo = useZorm("signup", FormSchema, {
            onValidSubmit(e) {
                e.preventDefault();
                spy(e.data);
            },
        });

        return (
            <form ref={zo.ref} data-testid="form">
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
            </form>
        );
    }

    render(<Test />);

    fireEvent.submit(screen.getByTestId("form"));
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({ colors: ["green"] });
});

test("can add custom issues", () => {
    const Schema = z.object({
        thing: z.string(),
    });

    const issues = createCustomIssues(Schema);
    issues.thing("custom issue");

    function Test() {
        const zo = useZorm("form", Schema, {
            customIssues: issues.toArray(),
        });

        return (
            <form ref={zo.ref} data-testid="form">
                <input name={zo.fields.thing()} />

                {zo.errors.thing((e) => {
                    return <div data-testid="error">{e.message}</div>;
                })}
            </form>
        );
    }

    render(<Test />);

    expect(screen.queryByTestId("error")).toHaveTextContent("custom issue");
});

test("can add custom issues with params", () => {
    const Schema = z.object({
        thing: z.string(),
    });

    const issues = createCustomIssues(Schema);
    issues.thing("custom issue", { my: "thing" });

    function Test() {
        const zo = useZorm("form", Schema, {
            customIssues: issues.toArray(),
        });

        return (
            <form ref={zo.ref} data-testid="form">
                <input name={zo.fields.thing()} />

                {zo.errors.thing((e) => {
                    if (e.code === "custom") {
                        return <div data-testid="error">{e.params?.my}</div>;
                    }
                })}
            </form>
        );
    }

    render(<Test />);

    expect(screen.queryByTestId("error")).toHaveTextContent("thing");
});

test("normal issues are rendered first", () => {
    const Schema = z.object({
        thing: z.string().min(5),
    });

    const issues = createCustomIssues(Schema);
    issues.thing("custom issue");

    function Test() {
        const zo = useZorm("form", Schema, {
            customIssues: issues.toArray(),
        });

        return (
            <form ref={zo.ref} data-testid="form">
                <input name={zo.fields.thing()} />

                {zo.errors.thing((e) => {
                    // e is a ZodIssue
                    e.code;
                    e.path;
                    e.message;

                    // @ts-expect-error
                    e.bad;

                    // @ts-expect-error
                    const _bad: number = e.code;

                    return <div data-testid="error">{e.message}</div>;
                })}
            </form>
        );
    }

    render(<Test />);

    fireEvent.submit(screen.getByTestId("form"));

    expect(screen.queryByTestId("error")).toHaveTextContent(
        "String must contain at least 5 character(s)",
    );
});

test("custom issues does not prevent submitting", () => {
    const validSubmitSpy = jest.fn();
    const formSubmitSpy = jest.fn();

    const Schema = z.object({
        thing: z.string(),
    });

    const issues = createCustomIssues(Schema);
    issues.thing("custom issue");

    function Test() {
        const zo = useZorm("form", Schema, {
            customIssues: issues.toArray(),
            onValidSubmit() {
                validSubmitSpy();
            },
        });

        return (
            <form
                ref={zo.ref}
                data-testid="form"
                onSubmit={(e) => {
                    formSubmitSpy({ defaultPrevented: e.defaultPrevented });
                }}
            >
                <input name={zo.fields.thing()} />

                {zo.errors.thing((e) => {
                    return <div data-testid="error">{e.message}</div>;
                })}
            </form>
        );
    }

    render(<Test />);

    fireEvent.submit(screen.getByTestId("form"));

    expect(validSubmitSpy).toBeCalledTimes(1);

    expect(formSubmitSpy).toBeCalledTimes(1);
    expect(formSubmitSpy).toHaveBeenLastCalledWith({ defaultPrevented: false });
});

test("normal issues prevent submit", () => {
    const validSubmitSpy = jest.fn();
    const formSubmitSpy = jest.fn();

    const Schema = z.object({
        thing: z.string().min(50),
    });

    function Test() {
        const zo = useZorm("form", Schema, {
            onValidSubmit() {
                validSubmitSpy();
            },
        });

        return (
            <form
                ref={zo.ref}
                data-testid="form"
                onSubmit={(e) => {
                    formSubmitSpy({ defaultPrevented: e.defaultPrevented });
                }}
            >
                <input name={zo.fields.thing()} defaultValue="too short" />

                {zo.errors.thing((e) => {
                    return <div data-testid="error">{e.message}</div>;
                })}
            </form>
        );
    }

    render(<Test />);

    fireEvent.submit(screen.getByTestId("form"));

    expect(validSubmitSpy).toBeCalledTimes(0);

    expect(formSubmitSpy).toBeCalledTimes(1);
    expect(formSubmitSpy).toHaveBeenLastCalledWith({ defaultPrevented: true });
});

test("updates onValidSubmit() closure", () => {
    const Schema = z.object({
        thing: z.string().min(1),
    });
    const spy = jest.fn();

    function Test() {
        const [ding, setDing] = useState("ding");

        const zo = useZorm("form", Schema, {
            onValidSubmit(e) {
                spy(ding);
                e.preventDefault();
            },
        });

        return (
            <form ref={zo.ref} data-testid="form">
                <input name={zo.fields.thing()} defaultValue="ok" />

                <button
                    type="button"
                    data-testid="button"
                    onClick={() => {
                        setDing("dong");
                    }}
                >
                    dong
                </button>
            </form>
        );
    }

    render(<Test />);

    fireEvent.click(screen.getByTestId("button"));
    fireEvent.submit(screen.getByTestId("form"));

    expect(spy).toHaveBeenCalledWith("dong");
});

test("can use function in the field chain", () => {
    const Schema = z.object({
        thing: z.string().min(1),
    });

    function Test() {
        const zo = useZorm("form", Schema);

        const typeTest1: string = zo.fields.thing(() => "str");
        const typeTest2: number = zo.fields.thing(() => 3);
        assertNotAny(zo.fields.thing(() => 3));

        return (
            <form ref={zo.ref} data-testid="form">
                {zo.fields.thing(
                    (props) => `name=${props.name} id=${props.id}`,
                )}
            </form>
        );
    }

    render(<Test />);

    expect(screen.queryByTestId("form")).toHaveTextContent(
        "name=thing id=form:thing",
    );
});

test("function in field chain can return jsx", () => {
    const Schema = z.object({
        thing: z.string().min(1),
    });

    function hidden(value: string) {
        return (props: { name: string; id: string }) => (
            <input
                type="hidden"
                name={props.name}
                id={props.id}
                data-testid="hidden"
                defaultValue={value}
            />
        );
    }

    function Test() {
        const zo = useZorm("form", Schema);

        return (
            <form ref={zo.ref} data-testid="form">
                {zo.fields.thing(hidden("testvalue"))}
            </form>
        );
    }

    render(<Test />);

    const el = screen.getByTestId("hidden");

    expect(el).toHaveAttribute("name", "thing");
    expect(el).toHaveAttribute("id", "form:thing");
    expect(el).toHaveAttribute("value", "testvalue");
});

test("can bound to lazily created form", () => {
    const spy = jest.fn();
    const Schema = z.object({
        thing: z.string().min(1),
    });

    function Test() {
        const [showForm, setShowForm] = useState(false);

        const zo = useZorm("form", Schema, {
            onValidSubmit(e) {
                spy();
                e.preventDefault();
            },
        });

        if (!showForm) {
            return (
                <button
                    type="button"
                    data-testid="button"
                    onClick={() => {
                        setShowForm(true);
                    }}
                >
                    show form
                </button>
            );
        }

        return (
            <form ref={zo.ref} data-testid="form">
                <input name={zo.fields.thing()} defaultValue="ok" />
            </form>
        );
    }

    render(<Test />);

    fireEvent.click(screen.getByTestId("button"));
    fireEvent.submit(screen.getByTestId("form"));

    expect(spy).toHaveBeenCalledTimes(1);
});

test.skip("[TYPE ONLY] can narrow validation type to success", () => {
    const Schema = z.object({
        thing: z.string(),
    });

    function Test() {
        const zo = useZorm("form", Schema);

        const customValidation = zo.validate();

        if (customValidation.success) {
            customValidation.data.thing;

            // @ts-expect-error
            customValidation.data.bad;
        }

        if (zo.validation?.success) {
            zo.validation.data.thing;

            // @ts-expect-error
            zo.validation.data.bad;
        }
    }
});

test("can validate files", async () => {
    const refineSpy = jest.fn();

    const Schema = z.object({
        myFile: z.instanceof(File).refine((file) => {
            refineSpy(file.type);
            return file.type === "image/png";
        }, "Only .png images are allowed"),
    });

    function Test() {
        const zo = useZorm("form", Schema);

        return (
            <form ref={zo.ref} data-testid="form">
                <input
                    data-testid="file"
                    type="file"
                    name={zo.fields.myFile()}
                />

                {zo.errors.myFile((e) => (
                    <div data-testid="error">{e.message}</div>
                ))}
            </form>
        );
    }

    render(<Test />);

    const file = new File(["(⌐□_□)"], "chucknorris.txt", {
        type: "text/plain",
    });

    const fileInput = screen.getByTestId("file") as HTMLInputElement;
    await userEvent.upload(fileInput, file);
    fireEvent.submit(screen.getByTestId("form"));

    expect(refineSpy).toHaveBeenCalledWith("text/plain");

    expect(screen.queryByTestId("error")).toHaveTextContent(
        "Only .png images are allowed",
    );
});

test("can submit files", async () => {
    const submitSpy = jest.fn();

    const Schema = z.object({
        myFile: z.instanceof(File).refine((file) => {
            return file.type === "image/png";
        }, "Only .png images are allowed"),
    });

    function Test() {
        const zo = useZorm("form", Schema, {
            onValidSubmit(e) {
                submitSpy(e.data.myFile.name);
            },
        });

        return (
            <form ref={zo.ref} data-testid="form">
                <input
                    data-testid="file"
                    type="file"
                    name={zo.fields.myFile()}
                />

                {zo.errors.myFile((e) => (
                    <div data-testid="error">{e.message}</div>
                ))}
            </form>
        );
    }

    render(<Test />);

    const file = new File(["(⌐□_□)"], "chucknorris.png", {
        type: "image/png",
    });

    const fileInput = screen.getByTestId("file") as HTMLInputElement;
    await userEvent.upload(fileInput, file);
    fireEvent.submit(screen.getByTestId("form"));

    expect(submitSpy).toHaveBeenCalledWith("chucknorris.png");
});
