import type {
  ZettlyDocumentV1,
  ZettlyDocumentNode,
  ZettlyMark,
  ZettlyNodeType,
  ZettlyMarkType,
  DocumentValidationIssue,
  DocumentValidationResult,
} from "../types/document";
import type { EditorPermissions } from "../types/editor";
import type { BlockCommandRegistry } from "../commands/block-command-registry";

export const ALLOWED_NODE_TYPES: Set<string> = new Set<ZettlyNodeType>([
  "doc",
  "paragraph",
  "heading",
  "bulletList",
  "orderedList",
  "listItem",
  "blockquote",
  "codeBlock",
  "horizontalRule",
  "hardBreak",
  "image",
  "text",
]);

export const ALLOWED_MARK_TYPES: Set<string> = new Set<ZettlyMarkType>([
  "bold",
  "italic",
  "underline",
  "strike",
  "code",
  "link",
]);

const SAFE_PROTOCOL_REGEX = /^(https?:|mailto:|\/|#)/i;
const DANGEROUS_PROTOCOL_REGEX = /^(javascript:|vbscript:|data:)/i;

export function isSafeUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (DANGEROUS_PROTOCOL_REGEX.test(trimmed)) return false;
  return SAFE_PROTOCOL_REGEX.test(trimmed);
}

export function createEmptyDocument(): ZettlyDocumentV1 {
  return {
    schemaVersion: 1,
    doc: {
      type: "doc",
      content: [
        {
          type: "paragraph",
        },
      ],
    },
  };
}

export function normalizeToDocumentV1(
  input: unknown
): ZettlyDocumentV1 | null {
  if (!input || typeof input !== "object") return null;

  const candidate = input as Record<string, unknown>;

  // Case 1: Already wrapped in ZettlyDocumentV1
  if (
    candidate.schemaVersion === 1 &&
    candidate.doc &&
    typeof candidate.doc === "object" &&
    (candidate.doc as Record<string, unknown>).type === "doc"
  ) {
    return candidate as unknown as ZettlyDocumentV1;
  }

  // Case 2: Raw TipTap/ProseMirror root node { type: 'doc', content: [...] }
  if (candidate.type === "doc" && Array.isArray(candidate.content)) {
    return {
      schemaVersion: 1,
      doc: candidate as unknown as ZettlyDocumentV1["doc"],
    };
  }

  return null;
}

export interface ValidationOptions {
  registry?: BlockCommandRegistry;
  permissions?: EditorPermissions;
  maxDepth?: number;
}

export function validateDocument(
  input: unknown,
  options: ValidationOptions = {}
): DocumentValidationResult {
  const issues: DocumentValidationIssue[] = [];
  const maxDepth = options.maxDepth ?? 50;

  const docV1 = normalizeToDocumentV1(input);
  if (!docV1) {
    return {
      valid: false,
      schemaVersion: 1,
      issues: [
        {
          path: "root",
          code: "INVALID_ROOT",
          message:
            "Document root must be a valid ZettlyDocumentV1 or a ProseMirror doc node.",
          severity: "error",
        },
      ],
    };
  }

  function validateNode(node: ZettlyDocumentNode, path: string, depth: number) {
    if (depth > maxDepth) {
      issues.push({
        path,
        code: "INVALID_ROOT",
        message: `Document exceeds maximum allowed nesting depth of ${maxDepth}.`,
        severity: "error",
      });
      return;
    }

    if (!ALLOWED_NODE_TYPES.has(node.type)) {
      issues.push({
        path,
        code: "UNKNOWN_NODE_TYPE",
        message: `Unknown or unsupported node type "${node.type}".`,
        severity: "error",
      });
    }

    // Permission checks
    if (node.type === "image" && options.permissions?.allowImages === false) {
      issues.push({
        path,
        code: "DISALLOWED_BY_PERMISSIONS",
        message: "Image nodes are disallowed by editor permissions.",
        severity: "error",
      });
    }

    // Node attribute validation
    if (node.type === "heading") {
      const level = node.attrs?.level;
      if (
        typeof level !== "number" ||
        !Number.isInteger(level) ||
        level < 1 ||
        level > 6
      ) {
        issues.push({
          path: `${path}.attrs.level`,
          code: "INVALID_ATTRS",
          message: `Heading level must be an integer between 1 and 6 (received ${level}).`,
          severity: "error",
        });
      }
    }

    if (node.type === "image") {
      const src = node.attrs?.src;
      if (typeof src !== "string" || !isSafeUrl(src)) {
        issues.push({
          path: `${path}.attrs.src`,
          code: "UNSAFE_URL",
          message: `Image src contains an unsafe or unsupported URL protocol: "${src}".`,
          severity: "error",
        });
      }
    }

    if (node.type === "text") {
      if (typeof node.text !== "string" || node.text.length === 0) {
        issues.push({
          path,
          code: "EMPTY_TEXT_NODE",
          message: "Text node contains empty text content.",
          severity: "warning",
        });
      }
    }

    // Marks validation
    if (Array.isArray(node.marks)) {
      node.marks.forEach((mark: ZettlyMark, markIdx: number) => {
        const markPath = `${path}.marks[${markIdx}]`;
        if (!ALLOWED_MARK_TYPES.has(mark.type)) {
          issues.push({
            path: markPath,
            code: "UNKNOWN_MARK_TYPE",
            message: `Unknown or unsupported mark type "${mark.type}".`,
            severity: "error",
          });
        }

        if (mark.type === "link") {
          if (options.permissions?.allowLinks === false) {
            issues.push({
              path: markPath,
              code: "DISALLOWED_BY_PERMISSIONS",
              message: "Link marks are disallowed by editor permissions.",
              severity: "error",
            });
          }

          const href = mark.attrs?.href;
          if (typeof href !== "string" || !isSafeUrl(href)) {
            issues.push({
              path: `${markPath}.attrs.href`,
              code: "UNSAFE_URL",
              message: `Link href contains an unsafe or disallowed URL protocol: "${href}".`,
              severity: "error",
            });
          }
        }
      });
    }

    // Child content validation
    if (Array.isArray(node.content)) {
      node.content.forEach((child, childIdx) => {
        validateNode(child, `${path}.content[${childIdx}]`, depth + 1);
      });
    }
  }

  if (Array.isArray(docV1.doc.content)) {
    docV1.doc.content.forEach((node, idx) => {
      validateNode(node, `doc.content[${idx}]`, 1);
    });
  }

  const hasErrors = issues.some((i) => i.severity === "error");
  return {
    valid: !hasErrors,
    schemaVersion: 1,
    issues,
  };
}

export function sanitizeDocument(
  input: ZettlyDocumentV1 | ZettlyDocumentNode
): ZettlyDocumentV1 {
  const normalized = normalizeToDocumentV1(input) ?? createEmptyDocument();

  function sanitizeNode(node: ZettlyDocumentNode): ZettlyDocumentNode | null {
    if (!ALLOWED_NODE_TYPES.has(node.type)) {
      return null;
    }

    const clean: ZettlyDocumentNode = { type: node.type };

    // Sanitize attrs
    if (node.attrs && typeof node.attrs === "object") {
      const cleanAttrs: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(node.attrs)) {
        if (key === "__proto__" || key === "constructor") continue;
        cleanAttrs[key] = val;
      }

      if (node.type === "heading") {
        const level = Number(cleanAttrs.level);
        cleanAttrs.level = Number.isInteger(level) && level >= 1 && level <= 6 ? level : 1;
      }

      if (node.type === "image") {
        const src = typeof cleanAttrs.src === "string" ? cleanAttrs.src : "";
        if (!isSafeUrl(src)) {
          return null; // Strip unsafe images entirely
        }
        cleanAttrs.src = src.trim();
        if (typeof cleanAttrs.alt === "string") {
          cleanAttrs.alt = cleanAttrs.alt.slice(0, 500);
        }
      }

      clean.attrs = cleanAttrs;
    }

    if (node.type === "text") {
      clean.text = typeof node.text === "string" ? node.text : "";
    }

    // Sanitize marks
    if (Array.isArray(node.marks)) {
      const cleanMarks: ZettlyMark[] = [];
      for (const mark of node.marks) {
        if (!ALLOWED_MARK_TYPES.has(mark.type)) continue;

        if (mark.type === "link") {
          const href = typeof mark.attrs?.href === "string" ? mark.attrs.href : "";
          if (isSafeUrl(href)) {
            cleanMarks.push({
              type: "link",
              attrs: { href: href.trim() },
            });
          }
        } else {
          cleanMarks.push({ type: mark.type });
        }
      }
      if (cleanMarks.length > 0) {
        clean.marks = cleanMarks;
      }
    }

    // Sanitize child content
    if (Array.isArray(node.content)) {
      const cleanContent: ZettlyDocumentNode[] = [];
      for (const child of node.content) {
        const sanitizedChild = sanitizeNode(child);
        if (sanitizedChild) {
          cleanContent.push(sanitizedChild);
        }
      }
      clean.content = cleanContent;
    }

    return clean;
  }

  const cleanContent: ZettlyDocumentNode[] = [];
  if (Array.isArray(normalized.doc.content)) {
    for (const child of normalized.doc.content) {
      const res = sanitizeNode(child);
      if (res) cleanContent.push(res);
    }
  }

  if (cleanContent.length === 0) {
    cleanContent.push({ type: "paragraph" });
  }

  return {
    schemaVersion: 1,
    doc: {
      type: "doc",
      content: cleanContent,
    },
  };
}
