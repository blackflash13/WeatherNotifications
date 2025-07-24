module.exports = {
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        project: "./tsconfig.json",
    },
    plugins: ["@typescript-eslint", "prettier"],
    extends: ["eslint:recommended", "@typescript-eslint/recommended", "prettier"],
    rules: {
        // Prettier integration
        "prettier/prettier": "error",

        // TypeScript specific rules
        "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
        "@typescript-eslint/no-explicit-any": "warn", // Allow any but warn
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-inferrable-types": "off",

        // General code quality rules
        "no-console": "off", // Allow console for server logging
        "prefer-const": "error",
        "no-var": "error",
        "object-shorthand": "error",
        "prefer-template": "error",

        // Import rules
        "sort-imports": [
            "error",
            {
                ignoreCase: true,
                ignoreDeclarationSort: true,
            },
        ],

        // Code style rules (handled by prettier mostly)
        quotes: ["error", "double", { avoidEscape: true }],
        semi: ["error", "always"],
        "comma-dangle": ["error", "only-multiline"],
    },
    env: {
        node: true,
        es6: true,
    },
    ignorePatterns: [
        "dist/",
        "node_modules/",
        "*.js", // Ignore compiled JS files
    ],
};
