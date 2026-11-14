import { describe, expect, test } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { spawnSync } from "node:child_process";
import { runCli } from "../cli";

const CLI_PATH = path.resolve(__dirname, "../../dist/cli.js");

function runSubprocess(args: string[], input?: string) {
  return spawnSync("node", [CLI_PATH, ...args], {
    input,
    encoding: "utf-8",
  });
}

describe("Headless CLI Binary (Milestone M4.3)", () => {
  describe("In-Memory CLI Function (runCli)", () => {
    test("prints version with --version flag", async () => {
      const code = await runCli(["--version"]);
      expect(code).toBe(0);
    });

    test("prints help with --help flag", async () => {
      const code = await runCli(["--help"]);
      expect(code).toBe(0);
    });

    test("returns exit code 2 on unknown command", async () => {
      const code = await runCli(["unknownCommand"]);
      expect(code).toBe(2);
    });
  });

  describe("Subprocess CLI Execution (Exit Codes & Commands)", () => {
    test("blocks subcommand lists 9 block items in json format", () => {
      const res = runSubprocess(["blocks", "--json"]);
      expect(res.status).toBe(0);

      const blocks = JSON.parse(res.stdout);
      expect(Array.isArray(blocks)).toBe(true);
      expect(blocks.length).toBe(9);
      expect(blocks.some((b: { id: string }) => b.id === "paragraph")).toBe(true);
      expect(blocks.some((b: { id: string }) => b.id === "heading-1")).toBe(true);
      expect(blocks.some((b: { id: string }) => b.id === "code-block")).toBe(true);
    });

    test("validate succeeds (exit code 0) on valid HTML", () => {
      const html = "<h1>Title</h1><p>A simple valid document.</p>";
      const res = runSubprocess(["validate", "-"], html);

      expect(res.status).toBe(0);
      expect(res.stdout).toContain("✓ Document is valid");
    });

    test("validate fails (exit code 1) on invalid JSON AST root", () => {
      const invalidAst = JSON.stringify({
        schemaVersion: 1,
        doc: { type: "invalidRoot", content: [] },
      });
      const res = runSubprocess(["validate", "--from=json", "-"], invalidAst);

      expect(res.status).toBe(1);
      expect(res.stderr).toContain("Document validation failed");
      expect(res.stderr).toContain("INVALID_ROOT");
    });

    test("validate with --json outputs machine-readable validation result", () => {
      const html = "<h1>Valid</h1><p>Clean text.</p>";
      const res = runSubprocess(["validate", "--json", "-"], html);

      expect(res.status).toBe(0);
      const parsed = JSON.parse(res.stdout);
      expect(parsed.valid).toBe(true);
      expect(parsed.errors).toEqual([]);
    });

    test("sanitize strips malicious script tag and inline handlers via stdin pipe", () => {
      const dirty = "<p>Safe text <script>alert('xss')</script><img src=\"x\" onerror=\"alert(1)\"></p>";
      const res = runSubprocess(["sanitize", "-"], dirty);

      expect(res.status).toBe(0);
      expect(res.stdout).not.toContain("<script>");
      expect(res.stdout).not.toContain("onerror");
      expect(res.stdout).toContain("<p>Safe text </p>");
    });

    test("sanitize with --to=markdown converts sanitized content to markdown", () => {
      const html = "<h2>Subtitle</h2><p>Paragraph with <strong>bold</strong> text.</p>";
      const res = runSubprocess(["sanitize", "--to=markdown", "-"], html);

      expect(res.status).toBe(0);
      expect(res.stdout).toContain("## Subtitle");
      expect(res.stdout).toContain("**bold**");
    });

    test("sanitize with --output writes to disk", () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "zettly-cli-test-"));
      const outFile = path.join(tempDir, "output.html");

      try {
        const res = runSubprocess(["sanitize", "--output", outFile, "-"], "<p>Disk output test</p>");
        expect(res.status).toBe(0);
        expect(fs.existsSync(outFile)).toBe(true);
        expect(fs.readFileSync(outFile, "utf-8")).toContain("<p>Disk output test</p>");
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });

    test("convert transforms HTML to JSON AST and vice versa", () => {
      const html = "<h1>Convert Test</h1><p>Content.</p>";
      const resToJson = runSubprocess(["convert", "--to=json", "-"], html);

      expect(resToJson.status).toBe(0);
      const doc = JSON.parse(resToJson.stdout);
      expect(doc.schemaVersion).toBe(1);
      expect(doc.doc.type).toBe("doc");

      const resToHtml = runSubprocess(["convert", "--from=json", "--to=html", "-"], resToJson.stdout);
      expect(resToHtml.status).toBe(0);
      expect(resToHtml.stdout).toContain("<h1>Convert Test</h1>");
    });

    test("stats calculates word count, reading time, and block distribution", () => {
      const html = "<h1>Heading</h1><p>First paragraph with five words.</p>";
      const res = runSubprocess(["stats", "--json", "-"], html);

      expect(res.status).toBe(0);
      const stats = JSON.parse(res.stdout);
      expect(stats.words).toBe(6);
      expect(stats.readingTimeMinutes).toBe(1);
      expect(stats.blockCounts["heading"]).toBe(1);
      expect(stats.blockCounts["paragraph"]).toBe(1);
    });

    test("inspect outputs outline and validation status in json format", () => {
      const html = "<h1>Main Section</h1><p>Text</p><h2>Subsection</h2><p>More text</p>";
      const res = runSubprocess(["inspect", "--json", "-"], html);

      expect(res.status).toBe(0);
      const report = JSON.parse(res.stdout);
      expect(report.valid).toBe(true);
      expect(report.outline).toEqual([
        { level: 1, text: "Main Section" },
        { level: 2, text: "Subsection" },
      ]);
    });

    test("returns exit code 2 when input file does not exist", () => {
      const res = runSubprocess(["validate", "non_existent_file_xyz_123.html"]);
      expect(res.status).toBe(2);
      expect(res.stderr).toContain("Failed to read input file");
    });
  });
});
