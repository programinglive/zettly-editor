import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { lowlight } from "lowlight";

// Import common languages
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import java from "highlight.js/lib/languages/java";
import cpp from "highlight.js/lib/languages/cpp";
import csharp from "highlight.js/lib/languages/csharp";
import php from "highlight.js/lib/languages/php";
import ruby from "highlight.js/lib/languages/ruby";
import go from "highlight.js/lib/languages/go";
import rust from "highlight.js/lib/languages/rust";
import swift from "highlight.js/lib/languages/swift";
import kotlin from "highlight.js/lib/languages/kotlin";
import sql from "highlight.js/lib/languages/sql";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import scss from "highlight.js/lib/languages/scss";
import yaml from "highlight.js/lib/languages/yaml";
import markdown from "highlight.js/lib/languages/markdown";

// Register languages with lowlight
lowlight.registerLanguage("javascript", javascript);
lowlight.registerLanguage("typescript", typescript);
lowlight.registerLanguage("python", python);
lowlight.registerLanguage("java", java);
lowlight.registerLanguage("cpp", cpp);
lowlight.registerLanguage("csharp", csharp);
lowlight.registerLanguage("php", php);
lowlight.registerLanguage("ruby", ruby);
lowlight.registerLanguage("go", go);
lowlight.registerLanguage("rust", rust);
lowlight.registerLanguage("swift", swift);
lowlight.registerLanguage("kotlin", kotlin);
lowlight.registerLanguage("sql", sql);
lowlight.registerLanguage("bash", bash);
lowlight.registerLanguage("json", json);
lowlight.registerLanguage("xml", xml);
lowlight.registerLanguage("html", xml);
lowlight.registerLanguage("css", css);
lowlight.registerLanguage("scss", scss);
lowlight.registerLanguage("yaml", yaml);
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
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "sql", label: "SQL" },
  { value: "bash", label: "Bash" },
  { value: "json", label: "JSON" },
  { value: "html", label: "HTML" },
  { value: "xml", label: "XML" },
  { value: "css", label: "CSS" },
  { value: "scss", label: "SCSS" },
  { value: "yaml", label: "YAML" },
  { value: "markdown", label: "Markdown" },
];
