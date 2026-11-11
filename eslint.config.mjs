import expoConfig from "eslint-config-expo/flat.js";
import { defineConfig } from "eslint/config";
import { configs as tseslintConfigs } from "typescript-eslint";

export default defineConfig([
  expoConfig,
  ...tseslintConfigs.recommended,
  {
    ignores: ["dist/*", ".expo/*", "node_modules/*"],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-deprecated": "warn",
    },
  },
]);
