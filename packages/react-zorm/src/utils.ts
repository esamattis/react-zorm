export function isValuedElement(
    input: any,
): input is HTMLInputElement | HTMLTextAreaElement {
    return (
        input instanceof HTMLInputElement ||
        input instanceof HTMLTextAreaElement
    );
}
