import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    core: "src/core/index.ts",
    cli: "src/cli/index.ts",
    codemod: "src/codemod/cli.ts",
  },
  format: ["cjs", "esm"],
  sourcemap: true,
  clean: true,
  dts: true,
  target: "es2019",
  minify: false,
  external: ["react", "react-dom", "typescript"],
});
