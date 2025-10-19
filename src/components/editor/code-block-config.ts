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

export const CodeBlockWithSyntaxHighlight = CodeBlockLowlight.extend({
  addKeyboardShortcuts() {
    return {
      "Mod-Enter": () => this.editor.commands.exitCode(),
      "Shift-Enter": () => this.editor.commands.exitCode(),
      Enter: () => {
        const { state } = this.editor;
        const { selection } = state;
        const { $from } = selection;

        if ($from.parent.type.name !== this.name) {
          return false;
        }

        const parent = $from.parent;
        const isAtEnd = $from.parentOffset === parent.content.size;
        const textBefore = parent.textBetween(0, $from.parentOffset, undefined, "\uFFFC");
        const textAfter = parent.textBetween($from.parentOffset, parent.content.size, undefined, "\uFFFC");
        const currentLine = textBefore.split(/\n/).pop() ?? "";
        const onEmptyLine = currentLine.trim().length === 0;

        if (isAtEnd && onEmptyLine && textAfter.length === 0) {
          return this.editor.commands.exitCode();
        }

        return false;
      },
      ArrowDown: () => {
        const { state } = this.editor;
        const { selection } = state;
        const { $from } = selection;

        if ($from.parent.type.name !== this.name) {
          return false;
        }

        const parent = $from.parent;
        const isAtEnd = $from.parentOffset === parent.content.size;

        if (isAtEnd) {
          return this.editor.commands.exitCode();
        }

        return false;
      },
    };
  },
}).configure({
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
