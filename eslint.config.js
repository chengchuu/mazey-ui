import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [ "coverage", "dist", "dist-api", "dist-dev", "docs" ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: [ "**/*.{js,mjs,ts,tsx}" ],
    rules: {
      "semi": [ "warn", "always" ],
      "quotes": [ "warn", "double" ],
      "indent": [ "warn", 2, { "SwitchCase": 1 } ],
      "comma-dangle": [ "warn", "always-multiline" ],
      "eol-last": [ "warn", "always" ],
      "spaced-comment": [ "warn", "always" ],
      "object-curly-spacing": [ "warn", "always" ],
      "array-bracket-spacing": [ "warn", "always" ],
      "object-curly-newline": [
        "warn",
        {
          "ImportDeclaration": {
            "multiline": true,
            "minProperties": 4,
          },
        },
      ],
    },
  },
  {
    files: [ "project.config.js", "scripts/**/*.{js,mjs}", "vitest.config.ts" ],
    languageOptions: {
      globals: {
        console: "readonly",
        process: "readonly",
        URL: "readonly",
      },
    },
  },
  {
    files: [ "site/service-worker.js" ],
    languageOptions: {
      globals: {
        caches: "readonly",
        __APP_SHELL__: "readonly",
        fetch: "readonly",
        Response: "readonly",
        self: "readonly",
        URL: "readonly",
      },
    },
  },
);
