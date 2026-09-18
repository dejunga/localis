import { defineConfig } from "vitest/config";
import { config } from "dotenv";
import path from "node:path";

config({ path: ".env.local" });

export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "lib/**/*.test.tsx"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
