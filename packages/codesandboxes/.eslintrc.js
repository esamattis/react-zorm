module.exports = {
    plugins: ["react-hooks"],
    parser: "@typescript-eslint/parser",
    rules: {
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
    },
};
