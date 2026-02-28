import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    globals: true,
    environment: "jsdom",
    include: ["__tests__/unit/**/*.test.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/dist/**", "./temp/**"],
    coverage: {
      provider: "v8",
      include: ["lib/**", "modules/**"],
      exclude: [
        "lib/generated/**",
        "lib/prisma.ts",
        "lib/auth.ts",
        "lib/auth-client.ts",
      ],
      reporter: ["text", "lcov"],
      thresholds: {
        lines: 70,
        functions: 70,
      },
    },
  },
});
