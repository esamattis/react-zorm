export function isValuedElement(
    input: any,
): input is HTMLInputElement | HTMLTextAreaElement {
    return (
        input instanceof HTMLInputElement ||
        input instanceof HTMLTextAreaElement ||
        input instanceof HTMLSelectElement
    );
}

export function arrayEquals(a: readonly any[], b: readonly any[]) {
    return (
        a.length === b.length &&
        a.every((item, index) => {
            return item === b[index];
        })
    );
}
