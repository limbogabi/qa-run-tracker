import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/qa-run-tracker/", // GitHub Pages subpath
  build: {
    outDir: "../docs",      // build into root/docs
    emptyOutDir: true
  }
});
