import { act, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import React, { useState } from "react";
import { z } from "zod";

import { useZorm } from "../src";
import { assertNotAny } from "./test-helpers";
import { useValue, Value } from "../src/use-value";

test("can read value with useValue()", () => {
    const Schema = z.object({
        thing: z.string().min(1),
    });

    function Test() {
        const zo = useZorm("form", Schema);
        const value = useValue({
            name: zo.fields.thing(),
            form: zo.ref,
        });
        assertNotAny(value);

        return (
            <form ref={zo.ref} data-testid="form">
                <input data-testid="input" name={zo.fields.thing()} />
                <div data-testid="value">{value}</div>
            </form>
        );
    }

    render(<Test />);

    userEvent.type(screen.getByTestId("input"), "value1");

    expect(screen.queryByTestId("value")).toHaveTextContent("value1");

    userEvent.type(screen.getByTestId("input"), "value2");

    expect(screen.queryByTestId("value")).toHaveTextContent("value1value2");
});

test("can read value with <Value/>", () => {
    const renderSpy = jest.fn();
    const valueRenderSpy = jest.fn();
    const Schema = z.object({
        thing: z.string().min(1),
    });

    function Test() {
        renderSpy();
        const zo = useZorm("form", Schema);

        return (
            <form ref={zo.ref} data-testid="form">
                <input data-testid="input" name={zo.fields.thing()} />
                <Value form={zo.ref} name={zo.fields.thing()}>
                    {(value) => {
                        valueRenderSpy();
                        return <div data-testid="value">{value}</div>;
                    }}
                </Value>
            </form>
        );
    }

    render(<Test />);

    userEvent.type(screen.getByTestId("input"), "value1");

    expect(screen.queryByTestId("value")).toHaveTextContent("value1");

    userEvent.type(screen.getByTestId("input"), "value2");

    expect(screen.queryByTestId("value")).toHaveTextContent("value1value2");

    expect(renderSpy).toHaveBeenCalledTimes(1);
    expect(valueRenderSpy.mock.calls.length).toBeGreaterThan(5);
});

test("can transform the value with <Value/>", () => {
    const renderSpy = jest.fn();
    const Schema = z.object({
        thing: z.string().min(1),
    });

    function Test() {
        renderSpy();
        const zo = useZorm("form", Schema);

        return (
            <form ref={zo.ref} data-testid="form">
                <input data-testid="input" name={zo.fields.thing()} />
                <Value
                    form={zo.ref}
                    name={zo.fields.thing()}
                    initialValue={0}
                    mapValue={(value) => Number(value)}
                >
                    {(value) => {
                        const _: number = value;
                        assertNotAny(value);
                        return <div data-testid="value">{typeof value}</div>;
                    }}
                </Value>
            </form>
        );
    }

    render(<Test />);

    userEvent.type(screen.getByTestId("input"), "value1");

    expect(screen.queryByTestId("value")).toHaveTextContent("number");
});

test("renders default value", () => {
    const Schema = z.object({
        thing: z.string().min(1),
    });

    function Test() {
        const zo = useZorm("form", Schema);

        const value: string = useValue({
            name: zo.fields.thing(),
            form: zo.ref,
        });

        return (
            <form ref={zo.ref} data-testid="form">
                <input
                    data-testid="input"
                    name={zo.fields.thing()}
                    defaultValue="defaultvalue"
                />
                <div data-testid="value">{value}</div>
            </form>
        );
    }

    render(<Test />);

    expect(screen.queryByTestId("value")).toHaveTextContent("defaultvalue");
});

test("can map value", () => {
    const Schema = z.object({
        thing: z.string().min(1),
    });

    function Test() {
        const zo = useZorm("form", Schema);

        const value = useValue({
            name: zo.fields.thing(),
            form: zo.ref,
            mapValue(value) {
                return value.toUpperCase();
            },
        });

        return (
            <form ref={zo.ref} data-testid="form">
                <input
                    data-testid="input"
                    name={zo.fields.thing()}
                    defaultValue="value"
                />
                <div data-testid="value">{value}</div>
            </form>
        );
    }

    render(<Test />);

    expect(screen.queryByTestId("value")).toHaveTextContent("VALUE");
});

test("can map to custom type", () => {
    const Schema = z.object({
        thing: z.string().min(1),
    });

    function Test() {
        const zo = useZorm("form", Schema);

        const value = useValue({
            name: zo.fields.thing(),
            form: zo.ref,
            initialValue: 0,
            mapValue(value) {
                return value.length;
            },
        });

        const _num: number = value;
        assertNotAny(value);

        return (
            <form ref={zo.ref} data-testid="form">
                <input
                    data-testid="input"
                    name={zo.fields.thing()}
                    defaultValue="value"
                />
                <div data-testid="value">{typeof value}</div>
            </form>
        );
    }

    render(<Test />);

    expect(screen.queryByTestId("value")).toHaveTextContent("number");
});

test("can read lazily rendered value", () => {
    const Schema = z.object({
        thing: z.string().min(1),
    });

    function Test() {
        const zo = useZorm("form", Schema);
        const [showInput, setShowInput] = useState(false);

        const value = useValue({
            name: zo.fields.thing(),
            form: zo.ref,
            initialValue: "initialvalue",
        });

        return (
            <form ref={zo.ref} data-testid="form">
                {showInput && (
                    <input data-testid="input" name={zo.fields.thing()} />
                )}
                <button
                    type="button"
                    onClick={() => {
                        setShowInput(true);
                    }}
                >
                    show
                </button>
                <div data-testid="value">{value}</div>
            </form>
        );
    }

    render(<Test />);

    expect(screen.queryByTestId("value")).toHaveTextContent("initialvalue");

    fireEvent.click(screen.getByText("show"));

    userEvent.type(screen.getByTestId("input"), "typed value");

    expect(screen.queryByTestId("value")).toHaveTextContent("typed value");
});

test("can read lazily rendered default value", () => {
    const Schema = z.object({
        thing: z.string().min(1),
    });

    function Test() {
        const zo = useZorm("form", Schema);
        const [showInput, setShowInput] = useState(false);

        const value = useValue({
            name: zo.fields.thing(),
            form: zo.ref,
            initialValue: "initialvalue",
        });

        return (
            <form ref={zo.ref} data-testid="form">
                {showInput && (
                    <input
                        data-testid="input"
                        name={zo.fields.thing()}
                        defaultValue="defaultvalue"
                    />
                )}
                <button
                    type="button"
                    onClick={() => {
                        setShowInput(true);
                    }}
                >
                    show
                </button>
                <div data-testid="value">{value}</div>
            </form>
        );
    }

    render(<Test />);

    expect(screen.queryByTestId("value")).toHaveTextContent("initialvalue");

    fireEvent.click(screen.getByText("show"));

    // XXX requires change simulation to be picked up
    const event = new Event("input", {
        bubbles: true,
        cancelable: true,
    });
    act(() => {
        screen.getByTestId("input").dispatchEvent(event);
    });
    // fireEvent.input(screen.getByTestId("input"));

    expect(screen.queryByTestId("value")).toHaveTextContent("defaultvalue");
});

test("can read checkbox", () => {
    const Schema = z.object({
        checkbox: z.string().optional(),
    });

    function Test() {
        const zo = useZorm("form", Schema);

        const value = useValue({
            name: zo.fields.checkbox(),
            form: zo.ref,
            initialValue: false,
            mapValue: (value) => {
                return Boolean(value);
            },
        });
        const _bool: boolean = value;
        assertNotAny(value);

        return (
            <form ref={zo.ref} data-testid="form">
                <input data-testid="checkbox" name={zo.fields.checkbox()} />
                <div data-testid="value">
                    {typeof value}: {String(value)}
                </div>
            </form>
        );
    }

    render(<Test />);

    expect(screen.queryByTestId("value")).toHaveTextContent("boolean: false");

    // This does not emit bubbling input event like in browser
    //     userEvent.click(screen.getByTestId("checkbox"));
    // So simulate it manually:

    const checkbox = screen.getByTestId("checkbox");
    if (checkbox instanceof HTMLInputElement) {
        checkbox.value = "on";
    }

    act(() => {
        const event = new Event("input", {
            bubbles: true,
            cancelable: true,
        });
        checkbox.dispatchEvent(event);
    });

    expect(screen.queryByTestId("value")).toHaveTextContent("boolean: true");
});
