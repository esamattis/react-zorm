import { readFileSync, writeFileSync } from "fs";

const rootPkg = JSON.parse(readFileSync("package.json"), "utf8");
const pkg = JSON.parse(readFileSync(process.argv[2], "utf8"));

Object.assign(pkg.dependencies, {
    "@types/react": "18.0.21",
    "@types/react-dom": "18.0.6",
    react: "18.2.0",
    "react-dom": "18.2.0",
    "react-zorm": "0.6.0",
    zod: "3.19.1",
});

pkg.devDependencies = {
    typescript: "4.8.4",
};

writeFileSync(process.argv[2], JSON.stringify(pkg, null, 2));
