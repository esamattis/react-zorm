import { assertNotNil } from "@valu/assert";
import { render } from "@testing-library/react";

export function makeForm(jsx: any) {
    render(jsx);
    const form = document.querySelector("form");
    assertNotNil(form);
    return form;
}

type IsAny<T> = unknown extends T ? (T extends {} ? T : never) : never;

type NotAny<T> = T extends IsAny<T> ? never : T;

export function assertNotAny<T>(x: NotAny<T>) {}
