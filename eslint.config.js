import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [ "coverage", "dist" ],
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
);
