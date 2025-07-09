import { defineConfig } from "vite";
import path from "path";

// This configuration is no longer used since backend functionality moved to /backend folder
export default defineConfig({
  build: {
    outDir: "dist/server",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
});
