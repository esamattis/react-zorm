module.exports = {
    testEnvironment: "jsdom",
    testPathIgnorePatterns: ["/node_modules", "dist", ".build"],
    testRegex: "(/__tests__/.+\\.(test|spec))\\.[jt]sx?$",
    transform: {
        "^.+\\.tsx?$": [
            "babel-jest",
            {
                presets: [
                    "@babel/preset-typescript",
                    "@babel/preset-react",
                    [
                        "@babel/preset-env",
                        {
                            targets: {
                                node: "current",
                            },
                        },
                    ],
                ],
            },
        ],
    },
    moduleFileExtensions: ["ts", "tsx", "js"],
    maxWorkers: process.platform === "darwin" ? "50%" : "100%",
    // Automatically clear mock calls, instances and results before every test
    clearMocks: true,
};
