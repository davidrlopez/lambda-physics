import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: {
      DATABASE_URL:
        "postgresql://lmbd_JDQcT8YBsp:RuWPVC0FFB8qbKUvQZKl@localhost:5432/lambda",
    },
  },
});
