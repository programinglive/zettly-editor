import type {
  ZettlyDocumentV1,
  ZettlyDocumentNode,
  ZettlyMark,
} from "../types/document";
import {
  createEmptyDocument,
  normalizeToDocumentV1,
  isSafeUrl,
  sanitizeDocument,
} from "./document-validator";

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function unescapeHtml(str: string): string {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/**
 * Pure JavaScript HTML tokenizer/parser that converts HTML into ZettlyDocumentV1
 * without requiring window, document, or browser DOM globals.
 */
export function htmlToDocument(html: string): ZettlyDocumentV1 {
  if (!html || typeof html !== "string") {
    return createEmptyDocument();
  }

  // 1. Strip dangerous tags and inline event handlers completely
  const cleanHtml = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "")
    .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");

  // 2. Tokenize top-level blocks
  const blockRegex =
    /<(p|h[1-6]|blockquote|pre|ul|ol|hr)(?:\s+[^>]*)?>([\s\S]*?)<\/\1>|<hr(?:\s+[^>]*)?\/?>|<img\s+([^>]*)\/?>/gi;

  const content: ZettlyDocumentNode[] = [];
  let match: RegExpExecArray | null;

  function parseInline(rawInner: string): ZettlyDocumentNode[] {
    // Strip unknown/disallowed inline tags (e.g. inline images with broken syntax)
    const sanitizedInner = rawInner.replace(/<[^>]*>/g, (tag) => {
      if (/^<\/?(strong|b|em|i|u|s|del|code|a|br)\b/i.test(tag)) return tag;
      return "";
    });

    const inlineNodes: ZettlyDocumentNode[] = [];
    const inlineRegex =
      /<(strong|b|em|i|u|s|del|code|a)(?:\s+([^>]*))?>([\s\S]*?)<\/\1>|<br\s*\/?>|([^<]+)/gi;

    let inMatch: RegExpExecArray | null;
    while ((inMatch = inlineRegex.exec(sanitizedInner)) !== null) {
      const [, tag, attrsStr, inner, plain] = inMatch;

      if (plain) {
        const text = unescapeHtml(plain);
        if (text) {
          inlineNodes.push({ type: "text", text });
        }
      } else if (inMatch[0].toLowerCase().startsWith("<br")) {
        inlineNodes.push({ type: "hardBreak" });
      } else if (tag) {
        const markType = tag.toLowerCase();
        const text = unescapeHtml(inner || "");
        if (!text) continue;

        const mark: ZettlyMark = { type: "" };
        if (markType === "strong" || markType === "b") mark.type = "bold";
        else if (markType === "em" || markType === "i") mark.type = "italic";
        else if (markType === "u") mark.type = "underline";
        else if (markType === "s" || markType === "del") mark.type = "strike";
        else if (markType === "code") mark.type = "code";
        else if (markType === "a") {
          mark.type = "link";
          const hrefMatch = (attrsStr || "").match(/href=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
          const href = hrefMatch ? hrefMatch[1] || hrefMatch[2] || hrefMatch[3] : "";
          if (isSafeUrl(href)) {
            mark.attrs = { href: href.trim() };
          }
        }

        if (mark.type) {
          const marks = [mark];
          inlineNodes.push({
            type: "text",
            text,
            marks: mark.type === "link" && !mark.attrs ? undefined : marks,
          });
        } else {
          inlineNodes.push({ type: "text", text });
        }
      }
    }

    return inlineNodes;
  }

  while ((match = blockRegex.exec(cleanHtml)) !== null) {
    const [full, tag, inner, imgAttrs] = match;
    const lowerTag = (tag || (full.toLowerCase().startsWith("<img") ? "img" : "hr")).toLowerCase();

    if (lowerTag === "hr") {
      content.push({ type: "horizontalRule" });
    } else if (lowerTag === "img") {
      const srcMatch = (imgAttrs || full).match(/src=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
      const altMatch = (imgAttrs || full).match(/alt=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
      const src = srcMatch ? srcMatch[1] || srcMatch[2] || srcMatch[3] : "";
      const alt = altMatch ? altMatch[1] || altMatch[2] || altMatch[3] : "";

      if (isSafeUrl(src)) {
        content.push({
          type: "image",
          attrs: { src: src.trim(), alt: alt.trim() },
        });
      }
    } else if (lowerTag.startsWith("h") && lowerTag.length === 2) {
      const level = parseInt(lowerTag[1], 10);
      const inlineChildren = parseInline(inner);
      content.push({
        type: "heading",
        attrs: { level },
        content: inlineChildren.length ? inlineChildren : undefined,
      });
    } else if (lowerTag === "p") {
      const inlineChildren = parseInline(inner);
      content.push({
        type: "paragraph",
        content: inlineChildren.length ? inlineChildren : undefined,
      });
    } else if (lowerTag === "blockquote") {
      const pRegex = /<p(?:\s+[^>]*)?>([\s\S]*?)<\/p>/gi;
      const paragraphs: ZettlyDocumentNode[] = [];
      let pMatch: RegExpExecArray | null;

      while ((pMatch = pRegex.exec(inner)) !== null) {
        const pChildren = parseInline(pMatch[1]);
        paragraphs.push({
          type: "paragraph",
          content: pChildren.length ? pChildren : undefined,
        });
      }

      if (paragraphs.length === 0) {
        const inlineChildren = parseInline(inner);
        paragraphs.push({
          type: "paragraph",
          content: inlineChildren.length ? inlineChildren : undefined,
        });
      }

      content.push({
        type: "blockquote",
        content: paragraphs,
      });
    } else if (lowerTag === "pre") {
      const codeInner = inner.replace(/<\/?code(?:\s+[^>]*)?>/gi, "");
      const codeText = unescapeHtml(codeInner);
      content.push({
        type: "codeBlock",
        content: codeText ? [{ type: "text", text: codeText }] : undefined,
      });
    } else if (lowerTag === "ul" || lowerTag === "ol") {
      const isOrdered = lowerTag === "ol";
      const itemRegex = /<li(?:\s+[^>]*)?>([\s\S]*?)<\/li>/gi;
      const items: ZettlyDocumentNode[] = [];
      let liMatch: RegExpExecArray | null;

      while ((liMatch = itemRegex.exec(inner)) !== null) {
        const liInner = liMatch[1];
        const inlineChildren = parseInline(liInner);
        items.push({
          type: "listItem",
          content: inlineChildren.length ? inlineChildren : undefined,
        });
      }

      content.push({
        type: isOrdered ? "orderedList" : "bulletList",
        content: items.length ? items : undefined,
      });
    }
  }

  // If no recognized blocks were parsed, fallback to wrapping entire plain text in a paragraph
  if (content.length === 0) {
    const stripped = cleanHtml.replace(/<[^>]+>/g, "").trim();
    if (stripped) {
      content.push({
        type: "paragraph",
        content: [{ type: "text", text: unescapeHtml(stripped) }],
      });
    } else {
      content.push({ type: "paragraph" });
    }
  }

  return sanitizeDocument({
    schemaVersion: 1,
    doc: {
      type: "doc",
      content,
    },
  });
}

/**
 * Serializes a ZettlyDocumentV1 AST into clean, standards-compliant HTML.
 */
export function documentToHtml(
  input: ZettlyDocumentV1 | ZettlyDocumentNode
): string {
  const doc = normalizeToDocumentV1(input);
  if (!doc || !Array.isArray(doc.doc.content)) {
    return "<p></p>";
  }

  function serializeMarks(text: string, marks?: ZettlyMark[]): string {
    let result = escapeHtml(text);
    if (!marks || !marks.length) return result;

    for (const mark of marks) {
      if (mark.type === "bold") result = `<strong>${result}</strong>`;
      else if (mark.type === "italic") result = `<em>${result}</em>`;
      else if (mark.type === "underline") result = `<u>${result}</u>`;
      else if (mark.type === "strike") result = `<s>${result}</s>`;
      else if (mark.type === "code") result = `<code>${result}</code>`;
      else if (mark.type === "link") {
        const href = typeof mark.attrs?.href === "string" ? mark.attrs.href : "#";
        result = `<a href="${escapeHtml(href)}">${result}</a>`;
      }
    }
    return result;
  }

  function serializeNode(node: ZettlyDocumentNode): string {
    if (node.type === "text") {
      return serializeMarks(node.text || "", node.marks);
    }
    if (node.type === "hardBreak") {
      return "<br>";
    }
    if (node.type === "horizontalRule") {
      return "<hr>";
    }
    if (node.type === "image") {
      const src = escapeHtml(String(node.attrs?.src || ""));
      const alt = escapeHtml(String(node.attrs?.alt || ""));
      return `<img src="${src}" alt="${alt}">`;
    }

    const children = Array.isArray(node.content)
      ? node.content.map(serializeNode).join("")
      : "";

    switch (node.type) {
      case "paragraph":
        return `<p>${children}</p>`;
      case "heading": {
        const level = node.attrs?.level || 1;
        return `<h${level}>${children}</h${level}>`;
      }
      case "blockquote":
        return `<blockquote>${children}</blockquote>`;
      case "codeBlock":
        return `<pre><code>${children}</code></pre>`;
      case "bulletList":
        return `<ul>${children}</ul>`;
      case "orderedList":
        return `<ol>${children}</ol>`;
      case "listItem":
        return `<li>${children}</li>`;
      default:
        return children;
    }
  }

  return doc.doc.content.map(serializeNode).join("");
}

/**
 * Converts a ZettlyDocumentV1 AST into CommonMark Markdown.
 */
export function documentToMarkdown(
  input: ZettlyDocumentV1 | ZettlyDocumentNode
): string {
  const doc = normalizeToDocumentV1(input);
  if (!doc || !Array.isArray(doc.doc.content)) {
    return "";
  }

  function formatInline(node: ZettlyDocumentNode): string {
    if (node.type === "text") {
      let t = node.text || "";
      if (node.marks) {
        for (const m of node.marks) {
          if (m.type === "bold") t = `**${t}**`;
          else if (m.type === "italic") t = `*${t}*`;
          else if (m.type === "strike") t = `~~${t}~~`;
          else if (m.type === "code") t = `\`${t}\``;
          else if (m.type === "link") t = `[${t}](${m.attrs?.href || "#"})`;
        }
      }
      return t;
    }
    if (node.type === "hardBreak") return "\n";
    if (node.type === "image") {
      return `![${node.attrs?.alt || ""}](${node.attrs?.src || ""})`;
    }
    if (Array.isArray(node.content)) {
      return node.content.map(formatInline).join("");
    }
    return "";
  }

  function renderChildren(node: ZettlyDocumentNode): string {
    if (!Array.isArray(node.content)) return "";
    return node.content.map(formatInline).join("");
  }

  const lines: string[] = [];

  for (const block of doc.doc.content) {
    if (block.type === "paragraph") {
      lines.push(renderChildren(block));
    } else if (block.type === "heading") {
      const level = Math.min(6, Math.max(1, Number(block.attrs?.level) || 1));
      lines.push(`${"#".repeat(level)} ${renderChildren(block)}`);
    } else if (block.type === "blockquote") {
      lines.push(`> ${renderChildren(block)}`);
    } else if (block.type === "codeBlock") {
      lines.push(`\`\`\`\n${renderChildren(block)}\n\`\`\``);
    } else if (block.type === "horizontalRule") {
      lines.push("---");
    } else if (block.type === "image") {
      lines.push(`![${block.attrs?.alt || ""}](${block.attrs?.src || ""})`);
    } else if (block.type === "bulletList") {
      if (Array.isArray(block.content)) {
        block.content.forEach((li) => {
          lines.push(`- ${renderChildren(li)}`);
        });
      }
    } else if (block.type === "orderedList") {
      if (Array.isArray(block.content)) {
        block.content.forEach((li, idx) => {
          lines.push(`${idx + 1}. ${renderChildren(li)}`);
        });
      }
    }
  }

  return lines.join("\n\n");
}

/**
 * Extracts normalized plain text with block breaks from a document.
 */
export function documentToPlainText(
  input: ZettlyDocumentV1 | ZettlyDocumentNode
): string {
  const doc = normalizeToDocumentV1(input);
  if (!doc || !Array.isArray(doc.doc.content)) {
    return "";
  }

  function extractNodeText(node: ZettlyDocumentNode): string {
    if (node.type === "text") return node.text || "";
    if (node.type === "hardBreak") return "\n";
    if (Array.isArray(node.content)) {
      return node.content.map(extractNodeText).join("");
    }
    return "";
  }

  return doc.doc.content
    .map(extractNodeText)
    .filter((line) => line.length > 0)
    .join("\n\n");
}
