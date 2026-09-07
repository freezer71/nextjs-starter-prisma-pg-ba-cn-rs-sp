import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Résout les alias `@/` définis dans tsconfig.json.
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next", "lib/generated"],
    env: {
      SKIP_ENV_VALIDATION: "1",
    },
  },
});
