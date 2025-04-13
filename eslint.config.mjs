import { defineConfig } from "eslint/config";
import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import _import from "eslint-plugin-import";
import typescriptEslintEslintPlugin from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([{
    extends: fixupConfigRules(compat.extends(
        "next",
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@tanstack/eslint-plugin-query/recommended",
        "plugin:jsx-a11y/recommended",
        "plugin:jest/recommended",
        "plugin:import/recommended",
        "plugin:import/typescript",
        "prettier",
    )),

    plugins: {
        import: fixupPluginRules(_import),
        "@typescript-eslint": fixupPluginRules(typescriptEslintEslintPlugin),
    },

    languageOptions: {
        globals: {
            ...globals.node,
            ...globals.browser,
        },

        parser: tsParser,
    },

    settings: {
        "import/resolver": {
            typescript: {},
        },

        react: {
            version: "detect",
        },
    },

    rules: {
        "default-param-last": 0,

        indent: [2, 2, {
            ignoredNodes: ["TemplateLiteral"],
            SwitchCase: 1,
        }],

        "key-spacing": 0,
        "jsx-a11y/no-onchange": 0,
        "no-case-declarations": 0,
        "no-console": 1,
        "no-constant-condition": 0,
        "no-else-return": 2,
        "no-multi-spaces": 0,
        "no-unneeded-ternary": 0,

        "no-unused-vars": [0, {
            vars: "all",
            args: "after-used",
        }],

        "no-use-before-define": 0,
        "no-var": 2,
        "prefer-promise-reject-errors": 0,
        quotes: [2, "single"],
        "quote-props": 0,
        radix: 2,
        "react-hooks/exhaustive-deps": 2,
        "react/prop-types": 0,
        "react/self-closing-comp": 2,
        "react/react-in-jsx-scope": 0,
        semi: [2, "always"],
        "space-before-function-paren": 0,
        "template-curly-spacing": 0,
        "@typescript-eslint/ban-ts-comment": 1,
        "@typescript-eslint/consistent-type-imports": 2,
        "@typescript-eslint/explicit-member-accessibility": 0,
        "@typescript-eslint/no-empty-function": 0,

        "@typescript-eslint/no-unused-vars": [2, {
            argsIgnorePattern: "^_",
        }],

        "@typescript-eslint/no-use-before-define": 2,
    },
}, {
    files: ["src/**/*.{ts,tsx}"],

    rules: {
        "import/order": [2, {
            groups: ["builtin", "external", "parent", "sibling", "index", "object", "type"],

            alphabetize: {
                order: "asc",
            },

            "newlines-between": "always",
        }],
    },
}]);