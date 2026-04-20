import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globalSetup: "./src/tests/setup.ts",
  },
});
