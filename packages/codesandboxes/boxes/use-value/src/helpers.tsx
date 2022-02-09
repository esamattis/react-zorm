import React, { useRef } from "react";

export function VisualizeRenders(props: { children: React.ReactNode }) {
    const renderRef = useRef(0);
    return (
        <fieldset className={renderRef.current % 2 === 0 ? "even" : "odd"}>
            <legend>{renderRef.current++} renders</legend>
            {props.children}
        </fieldset>
    );
}
