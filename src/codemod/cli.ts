#!/usr/bin/env node
import { runCodemod } from "./runner";

const summary = runCodemod(process.argv.slice(2));
if (summary.failed > 0) {
  process.exitCode = 1;
}
