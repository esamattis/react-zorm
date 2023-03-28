import React from "react";
import { parseForm, parseFormAny } from "../src/parse-form";
import { assertNotAny, makeForm } from "./test-helpers";
import { z } from "zod";
import { fieldChain } from "../src/chains";

describe("parse with schema", () => {
    test("basic", () => {
        const Schema = z.object({
            ding: z.string(),
        });

        const form = makeForm(
            <form>
                <input name="ding" defaultValue="dong" />
            </form>,
        );

        const res = parseForm(Schema, form);

        assertNotAny(res);

        // @ts-expect-error
        res.bad;

        expect(res).toEqual({
            ding: "dong",
        });
    });

    test("handles sparse arrays", () => {
        const Schema = z.object({
            things: z.array(
                z
                    .object({
                        ding: z.string(),
                    })
                    .nullish(),
            ),
        });

        const form = makeForm(
            <form>
                <input name="things[1].ding" defaultValue="dong" />
            </form>,
        );

        const res = parseForm(Schema, form);

        assertNotAny(res);

        expect(res).toEqual({
            things: [undefined, { ding: "dong" }],
        });
    });
});

describe("with any", () => {
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

    test("field with dot", () => {
        const form = makeForm(
            <form>
                <input name="['ding.dong']" defaultValue="value" />
            </form>,
        );

        expect(parseFormAny(form)).toEqual({
            "ding.dong": "value",
        });
    });

    test("field with space", () => {
        const form = makeForm(
            <form>
                <input name="['ding dong']" defaultValue="value" />
            </form>,
        );

        expect(parseFormAny(form)).toEqual({
            "ding dong": "value",
        });
    });

    test("handles sparse arrays", () => {
        // Form with zero field
        const form = makeForm(
            <form>
                <input name="things[1].ding" defaultValue="dong" />
            </form>,
        );

        const res = parseFormAny(form);

        // Assert there no hole the array
        expect("0" in res.things).toBe(true);

        expect(res).toEqual({
            things: [undefined, { ding: "dong" }],
        });
    });

    test("can handle files ", () => {
        const form = new FormData();
        const file = new File(["(⌐□_□)"], "chucknorris.txt", {
            type: "text/plain",
        });
        form.append("myFile", file);

        const res = parseFormAny(form);

        expect(res).toEqual({
            myFile: file,
        });

        expect(res.myFile).toBe(file);
    });
});

describe("combine chains with parsing", () => {
    test("nested", () => {
        const Schema = z.object({
            ding: z.object({
                dong: z.string(),
            }),
        });

        const chain = fieldChain("form", Schema, []);

        const form = makeForm(
            <form>
                <input name={chain.ding.dong()} defaultValue="value" />
            </form>,
        );

        const res = parseForm(Schema, form);

        expect(res).toEqual({
            ding: {
                dong: "value",
            },
        });
    });
});
