import { FlatCompat } from "@eslint/eslintrc";
import { defineConfig, globalIgnores } from "eslint/config";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

export default defineConfig([
  ...compat.extends("eslint-config-next/core-web-vitals", "eslint-config-next/typescript"),
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
  globalIgnores([".next/**", ".tmp/**", "node_modules/**", "public/uploads/**", "next-env.d.ts", "debug-hero.js"]),
]);
