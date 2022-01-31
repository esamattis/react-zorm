import { initFieldPathChain } from "../src/chains";

test("single", () => {
    const fields = initFieldPathChain("test");
    expect(fields.ding()).toEqual("ding");
});

test("single id", () => {
    const fields = initFieldPathChain("test");
    expect(fields.ding("id")).toEqual("test:ding");
});

test("nested object", () => {
    const fields = initFieldPathChain("test");
    expect(fields.ding.dong()).toEqual("ding.dong");
});

test("array of objects", () => {
    const fields = initFieldPathChain("test");
    expect(fields.things(0).ding()).toEqual("things[0].ding");
});

test("nested array", () => {
    const fields = initFieldPathChain("test");
    expect(fields.things(0).ding(0)()).toEqual("things[0].ding[0]");
});

test("array of string", () => {
    const fields = initFieldPathChain("test");
    expect(fields.things(0)()).toEqual("things[0]");
});

test("array of string with name arg", () => {
    const fields = initFieldPathChain("test");
    expect(fields.things(0)("name")).toEqual("things[0]");
});

test("state is not mixe up", () => {
    const fields = initFieldPathChain("test");
    expect(fields.ding()).toEqual("ding");
    expect(fields.dong()).toEqual("dong");
});
