import fs from "node:fs";
import path from "node:path";
import { migrateFileToModern, type CodemodFileResult } from "./migrate-v1";

export interface CodemodRunSummary {
  processed: number;
  modified: number;
  failed: number;
  results: CodemodFileResult[];
  errors: Array<{ filePath: string; message: string }>;
}

export function printCodemodUsage(): void {
  console.log(`
Zettly Editor Modern Migration Codemod
Usage:
  npx zettly-editor-migrate <files/dirs...> [--dry-run]

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

export function runCodemod(args: string[]): CodemodRunSummary {
  const isDryRun = args.includes("--dry-run");
  const targetArgs = args.filter(
    (arg) => arg !== "--dry-run" && arg !== "-h" && arg !== "--help"
  );

  if (targetArgs.length === 0 || args.includes("-h") || args.includes("--help")) {
    printCodemodUsage();
    return { processed: 0, modified: 0, failed: 0, results: [], errors: [] };
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
  console.log(
    `Scanning ${files.length} file(s)... Mode: ${isDryRun ? "DRY-RUN (No files modified)" : "WRITE"}\n`
  );

  let modifiedCount = 0;
  let failedCount = 0;
  const results: CodemodFileResult[] = [];
  const errors: Array<{ filePath: string; message: string }> = [];

  for (const file of files) {
    let content: string;
    try {
      content = fs.readFileSync(file, "utf8");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      failedCount++;
      errors.push({ filePath: file, message });
      console.error(`[ERROR] Failed to read ${path.relative(process.cwd(), file)}: ${message}`);
      continue;
    }

    const result = migrateFileToModern(file, content, { dryRun: isDryRun });
    results.push(result);

    if (result.modified) {
      if (!isDryRun) {
        try {
          fs.writeFileSync(file, result.outputCode, "utf8");
          modifiedCount++;
          console.log(`[MODIFIED] ${path.relative(process.cwd(), file)}:`);
          for (const ch of result.changes) {
            console.log(`  - ${ch}`);
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          failedCount++;
          errors.push({ filePath: file, message });
          console.error(
            `[ERROR] Failed to write ${path.relative(process.cwd(), file)}: ${message}`
          );
        }
      } else {
        modifiedCount++;
        console.log(`[MODIFIED] ${path.relative(process.cwd(), file)}:`);
        for (const ch of result.changes) {
          console.log(`  - ${ch}`);
        }
      }
    }

    if (result.warnings.length > 0) {
      console.warn(`[WARNING] ${path.relative(process.cwd(), file)}:`);
      for (const w of result.warnings) {
        console.warn(`  ! ${w}`);
      }
    }
  }

  console.log(
    `\nMigration completed: ${modifiedCount}/${files.length} file(s) modified${
      failedCount > 0 ? `, ${failedCount} failed` : ""
    }.`
  );

  return {
    processed: files.length,
    modified: modifiedCount,
    failed: failedCount,
    results,
    errors,
  };
}
