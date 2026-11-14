import { describe, expect, test } from "vitest";
import {
  createEmptyDocument,
  validateDocument,
  sanitizeDocument,
  htmlToDocument,
  documentToHtml,
  documentToMarkdown,
  documentToPlainText,
  getDocumentStats,
  inspectDocument,
  isSafeUrl,
} from "../core";
import type { ZettlyDocumentV1, ZettlyNodeType, ZettlyMarkType } from "../types/document";

describe("Headless Document Engine (Milestone M4.2)", () => {
  describe("URL Safety Validator", () => {
    test("accepts safe web, email, relative, and anchor protocols", () => {
      expect(isSafeUrl("https://example.com/doc")).toBe(true);
      expect(isSafeUrl("http://example.com")).toBe(true);
      expect(isSafeUrl("mailto:user@example.com")).toBe(true);
      expect(isSafeUrl("/articles/guide")).toBe(true);
      expect(isSafeUrl("#heading-1")).toBe(true);
    });

    test("rejects dangerous script and data schemes", () => {
      expect(isSafeUrl("javascript:alert(1)")).toBe(false);
      expect(isSafeUrl("JAVASCRIPT:alert(document.cookie)")).toBe(false);
      expect(isSafeUrl("data:text/html,<script>alert(1)</script>")).toBe(false);
      expect(isSafeUrl("vbscript:msgbox(1)")).toBe(false);
      expect(isSafeUrl("   javascript:void(0)   ")).toBe(false);
    });
  });

  describe("Schema Validator & Envelope (validateDocument)", () => {
    test("creates and validates canonical empty document", () => {
      const doc = createEmptyDocument();
      expect(doc.schemaVersion).toBe(1);
      expect(doc.doc.type).toBe("doc");
      expect(doc.doc.content).toHaveLength(1);
      expect(doc.doc.content[0].type).toBe("paragraph");

      const result = validateDocument(doc);
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    test("validates unwrapped ProseMirror doc root node", () => {
      const rawDoc = {
        type: "doc",
        content: [{ type: "paragraph", content: [{ type: "text", text: "Hello" }] }],
      };
      const result = validateDocument(rawDoc);
      expect(result.valid).toBe(true);
    });

    test("flags invalid root structures", () => {
      expect(validateDocument(null).valid).toBe(false);
      expect(validateDocument("string").valid).toBe(false);
      expect(validateDocument({ foo: "bar" }).valid).toBe(false);
    });

    test("flags unknown node and mark types", () => {
      const invalidDoc: ZettlyDocumentV1 = {
        schemaVersion: 1,
        doc: {
          type: "doc",
          content: [
            {
              type: "unknownWidget" as unknown as ZettlyNodeType,
              content: [
                {
                  type: "text",
                  text: "Hello",
                  marks: [{ type: "maliciousMark" as unknown as ZettlyMarkType }],
                },
              ],
            },
          ],
        },
      };

      const result = validateDocument(invalidDoc);
      expect(result.valid).toBe(false);
      expect(result.issues.some((i) => i.code === "UNKNOWN_NODE_TYPE")).toBe(true);
      expect(result.issues.some((i) => i.code === "UNKNOWN_MARK_TYPE")).toBe(true);
    });

    test("flags invalid heading levels outside 1..6", () => {
      const invalidHeading: ZettlyDocumentV1 = {
        schemaVersion: 1,
        doc: {
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 9 },
              content: [{ type: "text", text: "Invalid Heading" }],
            },
          ],
        },
      };

      const result = validateDocument(invalidHeading);
      expect(result.valid).toBe(false);
      expect(result.issues.some((i) => i.code === "INVALID_ATTRS")).toBe(true);
    });

    test("flags unsafe URLs in link marks and image nodes", () => {
      const maliciousDoc: ZettlyDocumentV1 = {
        schemaVersion: 1,
        doc: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Click me",
                  marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }],
                },
              ],
            },
            {
              type: "image",
              attrs: { src: "data:text/html,<script>alert(1)</script>" },
            },
          ],
        },
      };

      const result = validateDocument(maliciousDoc);
      expect(result.valid).toBe(false);
      expect(result.issues.filter((i) => i.code === "UNSAFE_URL")).toHaveLength(2);
    });

    test("enforces permission constraints", () => {
      const imageDoc: ZettlyDocumentV1 = {
        schemaVersion: 1,
        doc: {
          type: "doc",
          content: [
            {
              type: "image",
              attrs: { src: "https://example.com/photo.jpg" },
            },
          ],
        },
      };

      const disallowed = validateDocument(imageDoc, {
        permissions: { allowImages: false },
      });
      expect(disallowed.valid).toBe(false);
      expect(disallowed.issues.some((i) => i.code === "DISALLOWED_BY_PERMISSIONS")).toBe(true);
    });
  });

  describe("AST Sanitizer (sanitizeDocument)", () => {
    test("removes unknown nodes and neutralizes unsafe attributes in AST", () => {
      const dirtyDoc: ZettlyDocumentV1 = {
        schemaVersion: 1,
        doc: {
          type: "doc",
          content: [
            {
              type: "dangerousNode" as unknown as ZettlyNodeType,
            },
            {
              type: "paragraph",
              attrs: { __proto__: { admin: true }, validAttr: "ok" } as unknown as Record<string, unknown>,
              content: [
                {
                  type: "text",
                  text: "Click here",
                  marks: [
                    { type: "bold" },
                    { type: "link", attrs: { href: "javascript:alert(1)" } },
                  ],
                },
              ],
            },
            {
              type: "image",
              attrs: { src: "javascript:alert(2)", alt: "Hack" },
            },
          ],
        },
      };

      const clean = sanitizeDocument(dirtyDoc);
      expect(clean.schemaVersion).toBe(1);
      // Dangerous node stripped
      expect(clean.doc.content.some((n) => n.type === "dangerousNode")).toBe(false);
      // Prototype pollution stripped
      expect(Object.prototype.hasOwnProperty.call(clean.doc.content[0].attrs, "__proto__")).toBe(false);
      // Dangerous link mark stripped, bold preserved
      const textNode = clean.doc.content[0].content?.[0];
      expect(textNode?.marks).toEqual([{ type: "bold" }]);
      // Dangerous image node removed completely
      expect(clean.doc.content.some((n) => n.type === "image")).toBe(false);
    });
  });

  describe("HTML & Codec Interoperability (htmlToDocument & documentToHtml)", () => {
    test("losslessly roundtrips formatted text, headings, lists, and quotes", () => {
      const originalHtml =
        "<h1>Title</h1><p>This is <strong>bold</strong> and <em>italic</em> with a <a href=\"https://example.com\">link</a>.</p><blockquote><p>Quote block</p></blockquote><ul><li>Item 1</li><li>Item 2</li></ul><ol><li>Step 1</li></ol><hr>";

      const doc = htmlToDocument(originalHtml);
      expect(doc.schemaVersion).toBe(1);

      const generatedHtml = documentToHtml(doc);
      expect(generatedHtml).toContain("<h1>Title</h1>");
      expect(generatedHtml).toContain("<strong>bold</strong>");
      expect(generatedHtml).toContain("<em>italic</em>");
      expect(generatedHtml).toContain("<a href=\"https://example.com\">link</a>");
      expect(generatedHtml).toContain("<blockquote><p>Quote block</p></blockquote>");
      expect(generatedHtml).toContain("<ul><li>Item 1</li><li>Item 2</li></ul>");
      expect(generatedHtml).toContain("<ol><li>Step 1</li></ol>");
      expect(generatedHtml).toContain("<hr>");
    });

    test("completely strips malicious script tags and inline event handlers", () => {
      const maliciousHtml =
        "<p>Hello <script>alert(document.domain)</script><img src=\"x\" onerror=\"alert(1)\"> World</p><iframe src=\"https://evil.com\"></iframe>";

      const doc = htmlToDocument(maliciousHtml);
      const outputHtml = documentToHtml(doc);

      expect(outputHtml).not.toContain("<script");
      expect(outputHtml).not.toContain("alert");
      expect(outputHtml).not.toContain("<iframe");
      expect(outputHtml).not.toContain("onerror");
      expect(outputHtml).toContain("<p>Hello  World</p>");
    });
  });

  describe("Markdown Serializer (documentToMarkdown)", () => {
    test("converts AST into clean CommonMark Markdown", () => {
      const html =
        "<h1>Main Title</h1><p>Paragraph with **fake** and <strong>bold</strong> and <em>italic</em>.</p><ul><li>First</li><li>Second</li></ul><blockquote><p>A wise saying</p></blockquote>";

      const doc = htmlToDocument(html);
      const markdown = documentToMarkdown(doc);

      expect(markdown).toContain("# Main Title");
      expect(markdown).toContain("**bold**");
      expect(markdown).toContain("*italic*");
      expect(markdown).toContain("- First");
      expect(markdown).toContain("- Second");
      expect(markdown).toContain("> A wise saying");
    });
  });

  describe("Plain Text Extractor (documentToPlainText)", () => {
    test("extracts text with block paragraph separators", () => {
      const html = "<h1>Heading</h1><p>First paragraph.</p><p>Second paragraph.</p>";
      const doc = htmlToDocument(html);
      const text = documentToPlainText(doc);

      expect(text).toBe("Heading\n\nFirst paragraph.\n\nSecond paragraph.");
    });
  });

  describe("Document Analytics & Inspection (getDocumentStats & inspectDocument)", () => {
    test("calculates accurate word, character, and block statistics", () => {
      const html =
        "<h1>Zettly Editor Overview</h1><p>Writing is thinking. The best tools stay out of your way.</p><p>Visit <a href=\"https://example.com\">documentation</a> for guides.</p><img src=\"https://example.com/logo.png\" alt=\"Logo\">";

      const stats = getDocumentStats(html);
      expect(stats.words).toBe(18);
      expect(stats.characters).toBeGreaterThan(50);
      expect(stats.paragraphs).toBe(2);
      expect(stats.readingTimeMinutes).toBe(1);
      expect(stats.links).toHaveLength(1);
      expect(stats.links[0].href).toBe("https://example.com");
      expect(stats.images).toHaveLength(1);
      expect(stats.images[0].src).toBe("https://example.com/logo.png");
    });

    test("extracts heading outline during document inspection", () => {
      const html =
        "<h1>Architecture</h1><p>Intro</p><h2>Core Engine</h2><p>Details</p><h3>Validation</h3><p>More</p>";

      const report = inspectDocument(html);
      expect(report.valid).toBe(true);
      expect(report.schemaVersion).toBe(1);
      expect(report.outline).toEqual([
        { level: 1, text: "Architecture" },
        { level: 2, text: "Core Engine" },
        { level: 3, text: "Validation" },
      ]);
    });

    test("processes 1,000-paragraph document within 500ms budget", () => {
      const blocks = Array.from({ length: 1000 }, (_, i) => `<p>Paragraph ${i} with <strong>bold</strong> text.</p>`);
      const largeHtml = blocks.join("");

      const start = performance.now();
      const doc = htmlToDocument(largeHtml);
      const validation = validateDocument(doc);
      const sanitized = sanitizeDocument(doc);
      const htmlOut = documentToHtml(sanitized);
      const elapsedMs = performance.now() - start;

      expect(validation.valid).toBe(true);
      expect(doc.doc.content).toHaveLength(1000);
      expect(htmlOut.length).toBeGreaterThan(10000);
      expect(elapsedMs).toBeLessThan(500);
    });
  });
});
