import { createRoot } from "react-dom";
import React from "react";

import App from "./App";

const rootElement = document.getElementById("root");
if (!rootElement) {
    throw new Error("No root element found");
}
const root = createRoot(rootElement);
root.render(<App />, rootElement);
