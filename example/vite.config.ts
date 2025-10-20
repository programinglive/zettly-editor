import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";
  const disableHmr = process.env.VITE_DISABLE_HMR === "1";
  return {
    root: path.resolve(__dirname),
    plugins: [react()],
    server: {
      port: 5183,
      hmr: disableHmr ? false : { overlay: false },
    },
    resolve: {
      alias: [
        {
          find: /^@programinglive\/zettly-editor\/styles$/,
          replacement: isDev
            ? path.resolve(__dirname, "../src/components/editor/zettly-editor.css")
            : path.resolve(__dirname, "../dist/index.css"),
        },
        {
          find: /^@programinglive\/zettly-editor$/,
          replacement: isDev
            ? path.resolve(__dirname, "../src")
            : path.resolve(__dirname, "../dist/index.js"),
        },
      ],
    },
    optimizeDeps: {
      force: true,
      include: [
        "react",
        "react-dom",
        "@tiptap/react",
        "@tiptap/core",
        "@tiptap/starter-kit",
        "@tiptap/extension-code-block-lowlight",
        "lowlight",
        "highlight.js/lib/core",
        "highlight.js/lib/languages/javascript",
        "highlight.js/lib/languages/typescript",
        "highlight.js/lib/languages/bash",
        "highlight.js/lib/languages/json",
      ],
      esbuildOptions: {
        target: "es2020",
      },
    },
    build: {
      outDir: path.resolve(__dirname, "dist"),
      emptyOutDir: true,
      sourcemap: false,
      target: "es2020",
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom"],
            tiptap: [
              "@tiptap/react",
              "@tiptap/core",
              "@tiptap/starter-kit",
              "@tiptap/extension-code-block-lowlight",
            ],
            pm: [
              "prosemirror-state",
              "prosemirror-view",
              "prosemirror-model",
              "prosemirror-transform",
              "prosemirror-commands",
              "prosemirror-history",
              "prosemirror-keymap",
              "prosemirror-inputrules",
              "prosemirror-dropcursor",
              "prosemirror-gapcursor",
              "prosemirror-schema-list",
            ],
            highlight: ["lowlight", "highlight.js/lib/core"],
          },
        },
      },
    },
  };
});
