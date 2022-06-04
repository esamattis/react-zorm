import "./styles.css";
import { useState } from "react";
import { z } from "zod";
import { useZorm } from "react-zorm";

const FormSchema = z.object({
    hiddenInput: z.string(),
});

function Horverable(props: { onHover: () => any; children: string }) {
    return (
        <div className="hoverable" onMouseEnter={props.onHover}>
            {props.children}
        </div>
    );
}

/**
 *  Render function shortcut for creating hidden inputs
 */
function hidden(value: string) {
    return (props: { name: string; id: string }) => (
        <input
            type="hidden"
            name={props.name}
            id={props.id}
            defaultValue={value}
        />
    );
}

export default function Form() {
    const [hoverValue, setHoverValue] = useState("Nothing hovered");
    const zo = useZorm("signup", FormSchema, {
        onValidSubmit(e) {
            e.preventDefault();
        },
    });

    return (
        <form ref={zo.ref}>
            <h1>Hidden inputs</h1>
            {zo.fields.hiddenInput(hidden(hoverValue))}
            <div>
                <Horverable
                    onHover={() => {
                        setHoverValue("Left box hovered");
                    }}
                >
                    Hover me!
                </Horverable>
                <Horverable
                    onHover={() => {
                        setHoverValue("Right box hovered");
                    }}
                >
                    And me!
                </Horverable>
            </div>
            <button type="submit">Submit</button>
            <pre>Form result: {JSON.stringify(zo.validation, null, 2)}</pre>
        </form>
    );
}
