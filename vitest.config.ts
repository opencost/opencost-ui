import path from "node:path";
import { defineConfig } from "vitest/config";

// Separate from vite.config.ts on purpose: the React Router plugin there
// expects a full app build and must not run under the test runner.
export default defineConfig({
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "app"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./app/test/setup.ts"],
    include: ["app/**/*.test.{ts,tsx}"],
    css: false,
    coverage: {
      provider: "v8",
      include: [
        "app/lib/inference-cost.ts",
        "app/services/inference-cost.ts",
        "app/components/inference-*.tsx",
      ],
      reporter: ["text", "html"],
      thresholds: { lines: 90, branches: 90, functions: 90, statements: 90 },
    },
  },
});
