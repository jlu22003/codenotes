import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // New in eslint-config-next 16 (React Compiler rules). The flagged effects
    // are deliberate post-mount and external-store syncs (theme-dependent
    // images, matchMedia, autofilled form values, carousel state); keep them
    // visible as warnings rather than rewriting them in a dependency bump.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  globalIgnores([
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "public/_pagefind/**",
    ".impeccable/**",
  ]),
]);

export default eslintConfig;
