import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import React from "react";
import { z } from "zod";
import { useZorm } from "../src/use-zorm";
import { Form } from "@remix-run/react";

// XXX eeh, needs some kind of router context to work. Leaving here since it at
// least tests the ref type
test.skip("single field validation", () => {
    const Schema = z.object({
        thing: z.string().min(1),
    });

    function Test() {
        const zo = useZorm("form", Schema);

        return (
            <Form ref={zo.ref} data-testid="form">
                <input name={zo.fields.thing()} />

                {zo.errors.thing((e) => (
                    <div data-testid="error">{e.code}</div>
                ))}
            </Form>
        );
    }

    render(<Test />);

    fireEvent.submit(screen.getByTestId("form"));

    expect(screen.queryByTestId("error")).toHaveTextContent("too_small");
});
