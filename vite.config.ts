import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "~variables": path.resolve(__dirname, "src/styles/_variables"),
      "~animations": path.resolve(__dirname, "src/styles/_animations"),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "~variables" as *;`,
      },
    },
  },
});
