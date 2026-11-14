import type {
  ZettlyDocumentV1,
  ZettlyDocumentNode,
  DocumentStats,
  DocumentInspectionReport,
} from "../types/document";
import {
  normalizeToDocumentV1,
  validateDocument,
} from "./document-validator";
import { htmlToDocument, documentToPlainText } from "./document-codec";

export function getDocumentStats(
  input: string | ZettlyDocumentV1 | ZettlyDocumentNode
): DocumentStats {
  let doc: ZettlyDocumentV1 | null;

  if (typeof input === "string") {
    // If it looks like JSON, try parsing, otherwise parse as HTML
    const trimmed = input.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        doc = normalizeToDocumentV1(JSON.parse(trimmed));
      } catch {
        doc = htmlToDocument(input);
      }
    } else {
      doc = htmlToDocument(input);
    }
  } else {
    doc = normalizeToDocumentV1(input);
  }

  if (!doc) {
    return {
      characters: 0,
      charactersWithoutSpaces: 0,
      words: 0,
      sentences: 0,
      paragraphs: 0,
      readingTimeMinutes: 0,
      blockCounts: {},
      links: [],
      images: [],
    };
  }

  const blockCounts: Record<string, number> = {};
  const links: Array<{ href: string; text: string }> = [];
  const images: Array<{ src: string; alt: string }> = [];

  function traverse(node: ZettlyDocumentNode) {
    blockCounts[node.type] = (blockCounts[node.type] || 0) + 1;

    if (node.type === "image" && node.attrs?.src) {
      images.push({
        src: String(node.attrs.src),
        alt: String(node.attrs.alt || ""),
      });
    }

    if (Array.isArray(node.marks)) {
      for (const m of node.marks) {
        if (m.type === "link" && m.attrs?.href) {
          links.push({
            href: String(m.attrs.href),
            text: node.text || "",
          });
        }
      }
    }

    if (Array.isArray(node.content)) {
      for (const child of node.content) {
        traverse(child);
      }
    }
  }

  if (Array.isArray(doc.doc.content)) {
    for (const child of doc.doc.content) {
      traverse(child);
    }
  }

  const plainText = documentToPlainText(doc);
  const characters = plainText.length;
  const charactersWithoutSpaces = plainText.replace(/\s+/g, "").length;

  const words = plainText
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  const sentences = plainText
    .split(/[.!?]+(?:\s+|$)/)
    .filter((s) => s.trim().length > 0).length;

  const paragraphs = blockCounts["paragraph"] || 0;
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));

  return {
    characters,
    charactersWithoutSpaces,
    words,
    sentences,
    paragraphs,
    readingTimeMinutes: words > 0 ? readingTimeMinutes : 0,
    blockCounts,
    links,
    images,
  };
}

export function inspectDocument(
  input: string | ZettlyDocumentV1 | ZettlyDocumentNode
): DocumentInspectionReport {
  let doc: ZettlyDocumentV1 | null;

  if (typeof input === "string") {
    const trimmed = input.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        doc = normalizeToDocumentV1(JSON.parse(trimmed));
      } catch {
        doc = htmlToDocument(input);
      }
    } else {
      doc = htmlToDocument(input);
    }
  } else {
    doc = normalizeToDocumentV1(input);
  }

  const validation = validateDocument(doc);
  const stats = getDocumentStats(doc || "");
  const outline: Array<{ level: number; text: string }> = [];

  function extractHeadings(node: ZettlyDocumentNode) {
    if (node.type === "heading") {
      const level = Number(node.attrs?.level) || 1;
      const text = Array.isArray(node.content)
        ? node.content.map((c) => c.text || "").join("")
        : "";
      outline.push({ level, text });
    }
    if (Array.isArray(node.content)) {
      for (const child of node.content) {
        extractHeadings(child);
      }
    }
  }

  if (doc && Array.isArray(doc.doc.content)) {
    for (const child of doc.doc.content) {
      extractHeadings(child);
    }
  }

  return {
    valid: validation.valid,
    schemaVersion: 1,
    stats,
    issues: validation.issues,
    outline,
  };
}
