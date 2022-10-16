import * as React from "react";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";

export function registerTest(testName: string, App: any) {
    document.addEventListener("DOMContentLoaded", () => {
        const a = document.createElement("a");
        a.href = `?test=${testName}`;
        a.innerText = testName;
        document.querySelector(".tests")?.appendChild(a);

        const currentTest = new URLSearchParams(window.location.search).get(
            "test",
        );
        if (currentTest !== testName) {
            return;
        }

        const rootElement = document.getElementById("root");
        if (!rootElement) {
            throw new Error("No root element");
        }

        const root = createRoot(rootElement);

        root.render(
            <StrictMode>
                <App />
            </StrictMode>,
        );
    });
}
