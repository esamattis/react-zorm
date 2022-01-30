import React from "react";
import { parseFormAny } from "../src/parse-form";
import { makeForm } from "./test-helpers";

test("single field", () => {
    const form = makeForm(
        <form>
            <input name="ding" defaultValue="dong" />
        </form>,
    );

    expect(parseFormAny(form)).toEqual({
        ding: "dong",
    });
});

test("object", () => {
    const form = makeForm(
        <form>
            <input name="ding.dong" defaultValue="value" />
            <input name="ding.dong" defaultValue="value" />
        </form>,
    );

    expect(parseFormAny(form)).toEqual({
        ding: { dong: "value" },
    });
});

test("array", () => {
    const form = makeForm(
        <form>
            <input name="ding[0]" defaultValue="value1" />
            <input name="ding[1]" defaultValue="value2" />
        </form>,
    );

    expect(parseFormAny(form)).toEqual({
        ding: ["value1", "value2"],
    });
});

test("array with objects", () => {
    const form = makeForm(
        <form>
            <input name="nest[0].ding" defaultValue="value1" />
            <input name="nest[0].dong" defaultValue="value2" />

            <input name="nest[1].ding" defaultValue="value3" />
            <input name="nest[1].dong" defaultValue="value4" />
        </form>,
    );

    expect(parseFormAny(form)).toEqual({
        nest: [
            //
            { ding: "value1", dong: "value2" },
            { ding: "value3", dong: "value4" },
        ],
    });
});
