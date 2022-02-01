import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import React from "react";
import { z } from "zod";

import { useZorm } from "../src";

test("single field validation", () => {
    const Schema = z.object({
        thing: z.string().min(1),
    });

    function Test() {
        const zo = useZorm("form", Schema);

        return (
            <form data-testid="form" {...zo.props()}>
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
            <form data-testid="form" {...zo.props()}>
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

test("form is validated on blur after the first submit", () => {
    const Schema = z.object({
        thing: z.string().min(1),
    });

    function Test() {
        const zo = useZorm("form", Schema);

        return (
            <form data-testid="form" {...zo.props()}>
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

    userEvent.type(screen.getByTestId("input"), "content");
    fireEvent.blur(screen.getByTestId("input"));

    expect(screen.queryByTestId("ok")).toHaveTextContent("ok");
});

test("form data is validated", () => {
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
            <form data-testid="form" {...zo.props()}>
                <input data-testid="input" name={zo.fields.thing()} />
            </form>
        );
    }

    render(<Test />);

    userEvent.type(screen.getByTestId("input"), "content");
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
            <form data-testid="form" {...zo.props()}>
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
            <form data-testid="form" {...zo.props()}>
                <input name={zo.fields.thing()} />

                <div data-testid="error">{zo.errors.thing()?.code}</div>
            </form>
        );
    }

    render(<Test />);

    fireEvent.submit(screen.getByTestId("form"));

    expect(screen.queryByTestId("error")).toHaveTextContent("too_small");
});

test("can validate multiple dependent fields", () => {
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
            <form data-testid="form" {...zo.props()}>
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

    userEvent.type(screen.getByTestId("form:password.pw1"), "foo");
    userEvent.type(screen.getByTestId("form:password.pw2"), "bar");
    fireEvent.submit(screen.getByTestId("form"));

    expect(screen.queryByTestId("error")).toHaveTextContent(
        "passwords to not match",
    );
});

test("can validate multiple dependent root fields", () => {
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
            <form data-testid="form" {...zo.props()}>
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

    userEvent.type(screen.getByTestId("form:pw1"), "foo");
    userEvent.type(screen.getByTestId("form:pw2"), "bar");
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
            <form data-testid="form" {...zo.props()}>
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

test("can validate array of strings", () => {
    const Schema = z.object({
        strings: z.array(z.string().min(2)),
    });

    function Test() {
        const zo = useZorm("form", Schema);

        return (
            <form data-testid="form" {...zo.props()}>
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
        "Should be at least 2 characters",
    );
});
