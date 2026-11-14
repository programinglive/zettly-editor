#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { migrateFileToModern, type CodemodFileResult } from "../src/codemod/migrate-v1.ts";

function printUsage() {
  console.log(`
Zettly Editor Modern Migration Codemod
Usage:
  npx tsx scripts/run-codemod.ts <files/dirs...> [--dry-run]

Options:
  --dry-run    Display planned modifications without altering files on disk.
  -h, --help   Print this help message.
`);
}

function collectFiles(targetPath: string): string[] {
  const stat = fs.statSync(targetPath);
  if (stat.isFile()) {
    if (/\.(tsx|ts|jsx|js)$/.test(targetPath)) {
      return [targetPath];
    }
    return [];
  }

  const results: string[] = [];
  const entries = fs.readdirSync(targetPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".git") {
      continue;
    }
    const fullPath = path.join(targetPath, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(fullPath));
    } else if (/\.(tsx|ts|jsx|js)$/.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

export function runCodemod(args: string[]): {
  processed: number;
  modified: number;
  results: CodemodFileResult[];
} {
  const isDryRun = args.includes("--dry-run");
  const targetArgs = args.filter((arg) => arg !== "--dry-run" && arg !== "-h" && arg !== "--help");

  if (targetArgs.length === 0 || args.includes("-h") || args.includes("--help")) {
    printUsage();
    return { processed: 0, modified: 0, results: [] };
  }

  const files: string[] = [];
  for (const target of targetArgs) {
    if (fs.existsSync(target)) {
      files.push(...collectFiles(target));
    } else {
      console.warn(`[Warning] Path not found: ${target}`);
    }
  }

  console.log(`\n=== Zettly Editor Modern Migration Codemod ===`);
  console.log(`Scanning ${files.length} file(s)... Mode: ${isDryRun ? "DRY-RUN (No files modified)" : "WRITE"}\n`);

  let modifiedCount = 0;
  const results: CodemodFileResult[] = [];

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const result = migrateFileToModern(file, content, { dryRun: isDryRun });
    results.push(result);

    if (result.modified) {
      modifiedCount++;
      console.log(`[MODIFIED] ${path.relative(process.cwd(), file)}:`);
      for (const ch of result.changes) {
        console.log(`  - ${ch}`);
      }
      if (!isDryRun) {
        fs.writeFileSync(file, result.outputCode, "utf8");
      }
    }

    if (result.warnings.length > 0) {
      console.warn(`[WARNING] ${path.relative(process.cwd(), file)}:`);
      for (const w of result.warnings) {
        console.warn(`  ! ${w}`);
      }
    }
  }

  console.log(`\nMigration completed: ${modifiedCount}/${files.length} file(s) modified.`);
  return { processed: files.length, modified: modifiedCount, results };
}

if (process.argv[1] && process.argv[1].endsWith("run-codemod.ts")) {
  runCodemod(process.argv.slice(2));
}
