import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Mirrors the `@/* -> ./src/*` path alias from tsconfig.json so modules that
// import via `@/…` are resolvable under Vitest (Next handles this at build time).
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
