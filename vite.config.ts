import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  resolve: {
    alias: {
      "~variables": path.resolve(__dirname, "src/styles/_variables"),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "~variables" as *;`,
        api: "modern-compiler",
      },
    },
  },
  build: {
    outDir: "dist", // Ensure Vercel serves from the correct directory
  },
});
