import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  resolve: {
    alias: {
      "~variables": path.resolve(__dirname, "src/styles/_variables"),
      "~animations": path.resolve(__dirname, "src/styles/_animations"),
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
});
