import type { BlockCommandItem } from "./types";

export const defaultBlockCommands: BlockCommandItem[] = [
  {
    id: "paragraph",
    title: "Text",
    description: "Just start typing with plain text.",
    searchTerms: ["text", "paragraph", "p", "plain", "normal"],
    iconName: "Type",
    category: "basic",
    schemaNode: {
      type: "paragraph",
    },
    execute: (editor) => {
      editor.chain().focus().setParagraph().run();
    },
  },
  {
    id: "heading-1",
    title: "Heading 1",
    description: "Large section heading.",
    searchTerms: ["heading 1", "h1", "title", "large"],
    iconName: "Heading1",
    category: "basic",
    shortcut: "#",
    schemaNode: {
      type: "heading",
      attrs: { level: 1 },
    },
    execute: (editor) => {
      editor.chain().focus().toggleHeading({ level: 1 }).run();
    },
  },
  {
    id: "heading-2",
    title: "Heading 2",
    description: "Medium section heading.",
    searchTerms: ["heading 2", "h2", "subtitle", "medium"],
    iconName: "Heading2",
    category: "basic",
    shortcut: "##",
    schemaNode: {
      type: "heading",
      attrs: { level: 2 },
    },
    execute: (editor) => {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
    },
  },
  {
    id: "heading-3",
    title: "Heading 3",
    description: "Small section heading.",
    searchTerms: ["heading 3", "h3", "subheading", "small"],
    iconName: "Heading3",
    category: "basic",
    shortcut: "###",
    schemaNode: {
      type: "heading",
      attrs: { level: 3 },
    },
    execute: (editor) => {
      editor.chain().focus().toggleHeading({ level: 3 }).run();
    },
  },
  {
    id: "bullet-list",
    title: "Bullet List",
    description: "Create a simple bulleted list.",
    searchTerms: ["bullet", "list", "ul", "unordered", "points"],
    iconName: "List",
    category: "lists",
    shortcut: "-",
    schemaNode: {
      type: "bulletList",
    },
    execute: (editor) => {
      editor.chain().focus().toggleBulletList().run();
    },
  },
  {
    id: "ordered-list",
    title: "Numbered List",
    description: "Create a numbered sequence list.",
    searchTerms: ["ordered", "list", "ol", "number", "1.", "numbered"],
    iconName: "ListOrdered",
    category: "lists",
    shortcut: "1.",
    schemaNode: {
      type: "orderedList",
    },
    execute: (editor) => {
      editor.chain().focus().toggleOrderedList().run();
    },
  },
  {
    id: "blockquote",
    title: "Quote",
    description: "Capture an inspiring quote or callout.",
    searchTerms: ["quote", "blockquote", "callout", "cite"],
    iconName: "Quote",
    category: "advanced",
    shortcut: ">",
    schemaNode: {
      type: "blockquote",
    },
    execute: (editor) => {
      editor.chain().focus().toggleBlockquote().run();
    },
  },
  {
    id: "code-block",
    title: "Code Block",
    description: "Code snippet with syntax highlighting.",
    searchTerms: ["code", "pre", "syntax", "javascript", "typescript", "snippet"],
    iconName: "Code",
    category: "advanced",
    shortcut: "```",
    schemaNode: {
      type: "codeBlock",
    },
    execute: (editor) => {
      editor.chain().focus().toggleCodeBlock().run();
    },
  },
  {
    id: "horizontal-rule",
    title: "Divider",
    description: "Visually separate sections with a horizontal rule.",
    searchTerms: ["divider", "hr", "line", "separator", "rule", "break"],
    iconName: "Minus",
    category: "advanced",
    shortcut: "---",
    schemaNode: {
      type: "horizontalRule",
    },
    execute: (editor) => {
      editor.chain().focus().setHorizontalRule().run();
    },
  },
];
