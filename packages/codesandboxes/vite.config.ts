import { resolve, join } from "path";
import { defineConfig } from "vite";
import { readdirSync } from "fs";

// const entries = readdirSync(join(__dirname, "src"));

// const input = Object.fromEntries(
//     entries.flatMap((file) => {
//         if (!file.endsWith(".html")) {
//             return [];
//         }

//         const key = file.replace(".html", "");
//         const path = resolve(__dirname, "src", file);

//         // Wrap to extra [] to avoid flattening
//         return [[key, path]];
//     }),
// );

export default defineConfig({
    root: __dirname + "/boxes",
    // base: process.env.CI ? "/ui-examples/bundled/" : "",
    // build: {
    //     // outDir: __dirname + "/bundled-dist",
    //     // emptyOutDir: true,
    //     // minify: false,
    //     // target: "esnext",
    //     rollupOptions: {
    //         input,
    //     },
    // },
});
