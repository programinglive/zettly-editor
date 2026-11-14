#!/usr/bin/env node
import { runCodemod } from "../src/codemod/runner";

export { runCodemod };

if (process.argv[1] && process.argv[1].endsWith("run-codemod.ts")) {
  const summary = runCodemod(process.argv.slice(2));
  if (summary.failed > 0) {
    process.exitCode = 1;
  }
}
