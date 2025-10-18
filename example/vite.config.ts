import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  root: path.resolve(__dirname),
  plugins: [react()],
  server: {
    port: 5183,
  },
  resolve: {
    alias: {
      "@programinglive/zettly-editor": path.resolve(__dirname, "../src"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          tiptap: ["@tiptap/react", "@tiptap/core", "@tiptap/starter-kit"],
          highlight: ["lowlight", "@tiptap/extension-code-block-lowlight"],
        },
      },
    },
  },
});
