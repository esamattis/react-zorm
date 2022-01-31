module.exports = {
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint", "react-hooks"],
    rules: {
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
    },
};
