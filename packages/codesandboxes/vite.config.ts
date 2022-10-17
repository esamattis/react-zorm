import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { directoryPlugin } from "vite-plugin-list-directory-contents";

const ROOT = __dirname + "/boxes";

export default defineConfig({
    root: ROOT,
    plugins: [react(), directoryPlugin({ baseDir: ROOT })],
});
