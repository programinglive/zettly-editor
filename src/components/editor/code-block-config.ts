import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { lowlight } from "lowlight";

// Import common languages
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import markdown from "highlight.js/lib/languages/markdown";

// Register languages with lowlight
lowlight.registerLanguage("javascript", javascript);
lowlight.registerLanguage("typescript", typescript);
lowlight.registerLanguage("bash", bash);
lowlight.registerLanguage("json", json);
lowlight.registerLanguage("xml", xml);
lowlight.registerLanguage("html", xml);
lowlight.registerLanguage("css", css);
lowlight.registerLanguage("markdown", markdown);

export const CodeBlockWithSyntaxHighlight = CodeBlockLowlight.configure({
  lowlight,
  defaultLanguage: "javascript",
  HTMLAttributes: {
    class: "hljs",
  },
});

export const supportedLanguages = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "bash", label: "Bash" },
  { value: "json", label: "JSON" },
  { value: "html", label: "HTML" },
  { value: "xml", label: "XML" },
  { value: "css", label: "CSS" },
  { value: "markdown", label: "Markdown" },
];
