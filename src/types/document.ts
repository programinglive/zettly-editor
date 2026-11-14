export type ZettlyNodeType =
  | 'doc'
  | 'paragraph'
  | 'heading'
  | 'bulletList'
  | 'orderedList'
  | 'listItem'
  | 'blockquote'
  | 'codeBlock'
  | 'horizontalRule'
  | 'hardBreak'
  | 'image'
  | 'text';

export type ZettlyMarkType = 'bold' | 'italic' | 'underline' | 'strike' | 'code' | 'link';

export interface ZettlyMark {
  type: ZettlyMarkType | string;
  attrs?: Record<string, unknown>;
}

export interface ZettlyDocumentNode {
  type: ZettlyNodeType | string;
  attrs?: Record<string, unknown>;
  content?: ZettlyDocumentNode[];
  marks?: ZettlyMark[];
  text?: string;
}

export interface ZettlyDocumentV1 {
  schemaVersion: 1;
  doc: {
    type: 'doc';
    content: ZettlyDocumentNode[];
  };
}

export interface DocumentValidationIssue {
  path: string;
  code:
    | 'INVALID_ROOT'
    | 'UNKNOWN_NODE_TYPE'
    | 'UNKNOWN_MARK_TYPE'
    | 'INVALID_ATTRS'
    | 'UNSAFE_URL'
    | 'DISALLOWED_BY_PERMISSIONS'
    | 'EMPTY_TEXT_NODE';
  message: string;
  severity: 'error' | 'warning';
}

export interface DocumentValidationResult {
  valid: boolean;
  schemaVersion: 1;
  issues: DocumentValidationIssue[];
}

export interface DocumentStats {
  characters: number;
  charactersWithoutSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  readingTimeMinutes: number;
  blockCounts: Record<string, number>;
  links: Array<{ href: string; text: string }>;
  images: Array<{ src: string; alt: string }>;
}

export interface DocumentInspectionReport {
  valid: boolean;
  schemaVersion: 1;
  stats: DocumentStats;
  issues: DocumentValidationIssue[];
  outline: Array<{ level: number; text: string }>;
}
