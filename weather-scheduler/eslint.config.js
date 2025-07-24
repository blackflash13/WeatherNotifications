import typescriptEslint from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import prettier from "eslint-plugin-prettier";

export default [
    {
        files: ["src/**/*.ts"],
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: "module",
                project: "./tsconfig.json",
            },
        },
        plugins: {
            "@typescript-eslint": typescriptEslint,
            prettier,
        },
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

            // Code style rules (handled by prettier mostly)
            quotes: ["error", "double", { avoidEscape: true }],
            semi: ["error", "always"],
            "comma-dangle": ["error", "only-multiline"],

            // Require empty line before return statements
            "padding-line-between-statements": ["error", { blankLine: "always", prev: "*", next: "return" }],
        },
    },
    {
        ignores: ["dist/", "node_modules/", "*.js"],
    },
];
