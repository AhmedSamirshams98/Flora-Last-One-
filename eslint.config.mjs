import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
        plugins: ["tailwindcss"],  // مهم جداً

     rules: {
      // Turn off the rule that blocks arbitrary Tailwind values
      "tailwindcss/no-arbitrary-value": "off",

      // Optional: allow arbitrary values in specific patterns
      "tailwindcss/classnames-order": "off", // if ordering triggers errors
    },
  },
];

export default eslintConfig;
