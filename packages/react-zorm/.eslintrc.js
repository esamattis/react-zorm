module.exports = {
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint", "react-hooks"],
    parserOptions: {
        project: "./tsconfig.json",
    },
    rules: {
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
        "@typescript-eslint/no-floating-promises": "error",
    },
};
