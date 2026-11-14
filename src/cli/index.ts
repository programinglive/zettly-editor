#!/usr/bin/env node

import * as fs from "node:fs";
import * as path from "node:path";
import * as process from "node:process";
import {
  validateDocument,
  sanitizeDocument,
  htmlToDocument,
  documentToHtml,
  documentToMarkdown,
  documentToPlainText,
  getDocumentStats,
  inspectDocument,
} from "../core";
import { defaultBlockCommands } from "../commands/default-block-commands";
import type { ZettlyDocumentV1 } from "../types/document";

const VERSION = "0.3.0";

interface ParsedArgs {
  command?: string;
  file?: string;
  strict: boolean;
  json: boolean;
  from?: "html" | "json";
  to?: "html" | "json" | "md" | "markdown" | "text";
  output?: string;
  help: boolean;
  version: boolean;
}

function parseArgs(args: string[]): ParsedArgs {
  const parsed: ParsedArgs = {
    strict: false,
    json: false,
    help: false,
    version: false,
  };

  const positional: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "-h" || arg === "--help" || arg === "help") {
      parsed.help = true;
    } else if (arg === "-v" || arg === "--version" || arg === "version") {
      parsed.version = true;
    } else if (arg === "--strict") {
      parsed.strict = true;
    } else if (arg === "--json") {
      parsed.json = true;
    } else if (arg.startsWith("--from=")) {
      parsed.from = arg.slice(7) as ParsedArgs["from"];
    } else if (arg === "--from" && i + 1 < args.length) {
      parsed.from = args[++i] as ParsedArgs["from"];
    } else if (arg.startsWith("--to=")) {
      parsed.to = arg.slice(5) as ParsedArgs["to"];
    } else if (arg === "--to" && i + 1 < args.length) {
      parsed.to = args[++i] as ParsedArgs["to"];
    } else if (arg.startsWith("--output=")) {
      parsed.output = arg.slice(9);
    } else if (arg === "-o" || arg === "--output") {
      if (i + 1 < args.length) {
        parsed.output = args[++i];
      }
    } else if (arg === "-" || !arg.startsWith("-")) {
      positional.push(arg);
    } else {
      // Unknown flag
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  if (positional.length > 0) {
    parsed.command = positional[0];
  }
  if (positional.length > 1) {
    parsed.file = positional[1];
  }

  return parsed;
}

function printUsage(): void {
  const usage = `Usage:
  zettly-editor <command> [file] [options]

Commands:
  validate [file]            Validate a JSON or HTML document against the Zettly schema
  sanitize [file]            Sanitize HTML or JSON input and emit safe output
  inspect  [file]            Inspect document validity, heading outline, links, and block tree
  stats    [file]            Calculate word count, reading time, and block distribution
  convert  [file]            Convert between formats (--from html|json --to html|json|md|text)
  blocks                     List registered block definitions from BlockCommandRegistry

Options:
  --from <html|json>         Input format (auto-detected if omitted)
  --to <html|json|md|text>   Output format for convert/sanitize (default: html)
  --output, -o <file>        Write output to file instead of stdout
  --json                     Format CLI report output as machine-readable JSON
  --strict                   Fail with exit code 1 on warnings as well as errors
  -h, --help                 Print usage information
  -v, --version              Print package version

Deterministic Exit Codes:
  0: Success / Document valid
  1: Document validation failed / Strict check failed
  2: Command line error, invalid options, or file error
`;
  process.stdout.write(usage);
}

function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf-8");
    process.stdin.on("data", (chunk) => {
      data += chunk;
    });
    process.stdin.on("end", () => {
      resolve(data);
    });
    process.stdin.on("error", (err) => {
      reject(err);
    });
  });
}

async function getInputContent(file?: string): Promise<string> {
  if (!file || file === "-") {
    if (process.stdin.isTTY && !file) {
      throw new Error("No input file specified and stdin is empty.");
    }
    return await readStdin();
  }

  try {
    return fs.readFileSync(file, "utf-8");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to read input file '${file}': ${message}`);
  }
}

function detectDocument(raw: string, from?: "html" | "json"): ZettlyDocumentV1 {
  const trimmed = raw.trim();
  if (from === "json" || (!from && trimmed.startsWith("{"))) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && parsed.type === "doc") {
        return {
          schemaVersion: 1,
          doc: parsed,
        };
      }
      return parsed as ZettlyDocumentV1;
    } catch (err) {
      if (from === "json") {
        throw new Error(`Invalid JSON document: ${err instanceof Error ? err.message : String(err)}`);
      }
      // Fallback to HTML if JSON parsing failed and format was auto-detected
      return htmlToDocument(raw);
    }
  }

  return htmlToDocument(raw);
}

function emitOutput(content: string, outputFile?: string): void {
  if (outputFile) {
    fs.writeFileSync(outputFile, content, "utf-8");
  } else {
    process.stdout.write(content.endsWith("\n") ? content : content + "\n");
  }
}

export async function runCli(argv: string[] = process.argv.slice(2)): Promise<number> {
  let parsed: ParsedArgs;
  try {
    parsed = parseArgs(argv);
  } catch (err) {
    process.stderr.write(`Error: ${err instanceof Error ? err.message : String(err)}\n\n`);
    printUsage();
    return 2;
  }

  if (parsed.version) {
    process.stdout.write(`zettly-editor v${VERSION}\n`);
    return 0;
  }

  if (parsed.help || !parsed.command) {
    printUsage();
    return parsed.help ? 0 : 2;
  }

  const { command, file, strict, json, from, to, output } = parsed;

  try {
    switch (command) {
      case "blocks": {
        const blocks = defaultBlockCommands.map((b) => ({
          id: b.id,
          title: b.title,
          description: b.description,
          category: b.category,
          shortcut: b.shortcut,
          schemaNode: b.schemaNode,
        }));

        if (json) {
          emitOutput(JSON.stringify(blocks, null, 2), output);
        } else {
          let text = "Registered Block Commands:\n\n";
          for (const b of blocks) {
            text += `  • [${b.id}] ${b.title} (${b.category})\n    ${b.description}\n`;
            if (b.schemaNode) {
              text += `    Schema: ${JSON.stringify(b.schemaNode)}\n`;
            }
          }
          emitOutput(text, output);
        }
        return 0;
      }

      case "validate": {
        const raw = await getInputContent(file);
        const doc = detectDocument(raw, from);
        const result = validateDocument(doc);

        const errors = result.issues.filter((i) => i.severity === "error");
        const warnings = result.issues.filter((i) => i.severity === "warning");
        const isFailure = errors.length > 0 || (strict && warnings.length > 0);

        if (json) {
          const jsonOutput = {
            valid: !isFailure,
            schemaVersion: result.schemaVersion,
            errors,
            warnings,
            issues: result.issues,
          };
          emitOutput(JSON.stringify(jsonOutput, null, 2), output);
        } else {
          if (!isFailure) {
            emitOutput(`✓ Document is valid (${errors.length} errors, ${warnings.length} warnings)`, output);
          } else {
            let msg = `✗ Document validation failed (${errors.length} errors, ${warnings.length} warnings):\n`;
            for (const err of errors) {
              msg += `  [ERROR] ${err.path}: ${err.message} (${err.code})\n`;
            }
            for (const warn of warnings) {
              msg += `  [WARN]  ${warn.path}: ${warn.message} (${warn.code})\n`;
            }
            process.stderr.write(msg);
          }
        }

        return isFailure ? 1 : 0;
      }

      case "sanitize": {
        const raw = await getInputContent(file);
        const isJson = from === "json" || (!from && raw.trim().startsWith("{"));
        const doc = detectDocument(raw, from);
        const sanitized = sanitizeDocument(doc);

        const targetFormat = to || (isJson ? "json" : "html");

        let resultString: string;
        if (targetFormat === "json") {
          resultString = JSON.stringify(sanitized, null, 2);
        } else if (targetFormat === "md" || targetFormat === "markdown") {
          resultString = documentToMarkdown(sanitized);
        } else if (targetFormat === "text") {
          resultString = documentToPlainText(sanitized);
        } else {
          resultString = documentToHtml(sanitized);
        }

        emitOutput(resultString, output);
        return 0;
      }

      case "convert": {
        const raw = await getInputContent(file);
        const isJson = from === "json" || (!from && raw.trim().startsWith("{"));
        const doc = detectDocument(raw, from);

        const targetFormat = to || (isJson ? "html" : "json");

        let resultString: string;
        if (targetFormat === "json") {
          resultString = JSON.stringify(doc, null, 2);
        } else if (targetFormat === "md" || targetFormat === "markdown") {
          resultString = documentToMarkdown(doc);
        } else if (targetFormat === "text") {
          resultString = documentToPlainText(doc);
        } else {
          resultString = documentToHtml(doc);
        }

        emitOutput(resultString, output);
        return 0;
      }

      case "stats": {
        const raw = await getInputContent(file);
        const docOrHtml = from === "json" || (!from && raw.trim().startsWith("{"))
          ? detectDocument(raw, from)
          : raw;

        const stats = getDocumentStats(docOrHtml);

        if (json) {
          emitOutput(JSON.stringify(stats, null, 2), output);
        } else {
          const headingsCount = stats.blockCounts["heading"] || 0;
          const listsCount = (stats.blockCounts["bulletList"] || 0) + (stats.blockCounts["orderedList"] || 0);
          const codeBlocksCount = stats.blockCounts["codeBlock"] || 0;
          const blockquotesCount = stats.blockCounts["blockquote"] || 0;

          const text = [
            "Document Statistics:",
            `  • Words: ${stats.words}`,
            `  • Characters: ${stats.characters} (${stats.charactersWithoutSpaces} without spaces)`,
            `  • Paragraphs: ${stats.paragraphs}`,
            `  • Sentences: ${stats.sentences}`,
            `  • Headings: ${headingsCount}`,
            `  • Lists: ${listsCount}`,
            `  • Code Blocks: ${codeBlocksCount}`,
            `  • Blockquotes: ${blockquotesCount}`,
            `  • Images: ${stats.images.length}`,
            `  • Links: ${stats.links.length}`,
            `  • Estimated Reading Time: ${stats.readingTimeMinutes} min`,
          ].join("\n");
          emitOutput(text, output);
        }
        return 0;
      }

      case "inspect": {
        const raw = await getInputContent(file);
        const docOrHtml = from === "json" || (!from && raw.trim().startsWith("{"))
          ? detectDocument(raw, from)
          : raw;

        const report = inspectDocument(docOrHtml);

        if (json) {
          emitOutput(JSON.stringify(report, null, 2), output);
        } else {
          const errors = report.issues.filter((i) => i.severity === "error");
          const warnings = report.issues.filter((i) => i.severity === "warning");

          let text = "Document Inspection Report:\n\n";
          text += `  Validation: ${report.valid ? "✓ Valid" : "✗ Invalid"} (${errors.length} errors, ${warnings.length} warnings)\n`;
          text += `  Words: ${report.stats.words} | Characters: ${report.stats.characters} | Reading time: ${report.stats.readingTimeMinutes} min\n\n`;
          text += "  Heading Outline:\n";
          if (report.outline.length === 0) {
            text += "    (No headings found)\n";
          } else {
            for (const h of report.outline) {
              const indent = "  ".repeat(h.level);
              text += `  ${indent}H${h.level}: ${h.text}\n`;
            }
          }
          emitOutput(text, output);
        }
        return 0;
      }

      default: {
        process.stderr.write(`Error: Unknown command '${command}'.\n\n`);
        printUsage();
        return 2;
      }
    }
  } catch (err) {
    process.stderr.write(`Error: ${err instanceof Error ? err.message : String(err)}\n`);
    return 2;
  }
}

// Auto-run if executed directly via CLI
const entryBasename = process.argv[1] ? path.basename(process.argv[1]) : "";
const isDirectEntry =
  entryBasename === "zettly-editor" ||
  entryBasename === "cli.js" ||
  entryBasename === "cli.mjs" ||
  (entryBasename === "index.ts" && process.argv[1].includes("/cli/"));

if (isDirectEntry) {
  runCli().then((exitCode) => {
    if (exitCode !== 0) {
      process.exit(exitCode);
    }
  }).catch((err) => {
    process.stderr.write(`Fatal error: ${err instanceof Error ? err.message : String(err)}\n`);
    process.exit(2);
  });
}
