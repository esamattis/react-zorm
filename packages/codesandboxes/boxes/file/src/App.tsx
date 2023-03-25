import "./styles.css";
import React from "react";
import { z } from "zod";
import { useZorm } from "react-zorm";

const MAX_FILE_SIZE = 500000;
const ACCEPTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
];

const FormSchema = z.object({
    image: z
        .instanceof(File)
        .refine((file) => file.name !== undefined, "Please upload an image.")
        .refine((file) => file?.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
        .refine(
            (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
            "Only .jpg, .jpeg, .png and .webp formats are supported.",
        ),
});

function ErrorMessage(props: { message: string }) {
    return <div className="error-message">{props.message}</div>;
}

export default function Signup() {
    const zo = useZorm("signup", FormSchema, {
        onValidSubmit(e) {
            e.preventDefault();
            alert(`
                File: ${e.data.image.name}
                Size: ${e.data.image.size}
            `);
        },
    });
    const disabled = zo.validation?.success === false;

    return (
        <form ref={zo.ref}>
            Select an image:
            <input
                type="file"
                name={zo.fields.image()}
                className={zo.errors.image("errored")}
            />
            {zo.errors.image((e) => (
                <ErrorMessage message={e.message} />
            ))}
            <button disabled={disabled} type="submit">
                Upload!
            </button>
            {zo.validation?.success ? (
                <>
                    <p>File: {zo.validation.data.image.name}</p>
                    <p>Size: {zo.validation.data.image.size}</p>
                </>
            ) : null}
        </form>
    );
}
