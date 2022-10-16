import { resolve, join } from "path";
import { defineConfig } from "vite";
import { readdirSync } from "fs";

// const entries = readdirSync(join(__dirname, "bundled"));

// const input = Object.fromEntries(
// 	entries.flatMap((dir) => {
// 		const entry = [dir, resolve(__dirname, "bundled", dir, "index.html")];

// 		// Wrap to extra [] to avoid flattening
// 		return [entry];
// 	}),
// );

export default defineConfig({
    root: __dirname + "/e2e",
    server: {
        port: 1934,
        strictPort: true,
    },
    build: {
        outDir: __dirname + "/esm",
        emptyOutDir: true,
        minify: false,
        target: "es2020",
        sourcemap: true,
        rollupOptions: {
            external: ["react", "react-dom", "zod"],
        },
        lib: {
            entry: __dirname + "/src/index.tsx",
            formats: ["es"],
        },
    },
});
