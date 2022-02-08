import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import React from "react";
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

test("renders default value", () => {
    const Schema = z.object({
        thing: z.string().min(1),
    });

    function Test() {
        const zo = useZorm("form", Schema);

        const value = useValue({
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
