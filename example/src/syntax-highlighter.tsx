import { useMemo } from "react";
import hljs from "highlight.js/lib/core";
import xml from "highlight.js/lib/languages/xml";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";

const languageLoaders: Record<string, () => void> = {
  xml: () => hljs.registerLanguage("xml", xml),
  html: () => hljs.registerLanguage("html", xml),
  javascript: () => hljs.registerLanguage("javascript", javascript),
  js: () => hljs.registerLanguage("javascript", javascript),
  typescript: () => hljs.registerLanguage("typescript", typescript),
  ts: () => hljs.registerLanguage("typescript", typescript),
  bash: () => hljs.registerLanguage("bash", bash),
  shell: () => hljs.registerLanguage("bash", bash),
  json: () => hljs.registerLanguage("json", json),
};

const ensureLanguageRegistered = (lang: string) => {
  const key = lang.toLowerCase();
  if (hljs.getLanguage(key)) {
    return;
  }
  const loader = languageLoaders[key];
  if (loader) {
    loader();
  } else {
    languageLoaders.xml();
  }
};

ensureLanguageRegistered("xml");

interface SyntaxHighlighterProps {
  code: string;
  language?: string;
  className?: string;
}

export function SyntaxHighlighter({ code, language = "html", className }: SyntaxHighlighterProps) {
  const highlighted = useMemo(() => {
    const requestedLang = language.toLowerCase();
    ensureLanguageRegistered(requestedLang);
    const lang = hljs.getLanguage(requestedLang) ? requestedLang : "xml";
    try {
      const { value } = hljs.highlight(code, { language: lang });
      return { html: value, lang } as const;
    } catch (error) {
      return { html: escapeHtml(code), lang: "xml" as const };
    }
  }, [code, language]);

  const combinedClassName = [
    "hljs max-h-72 overflow-auto rounded-xl p-4 text-xs leading-6 transition-colors",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <pre className={combinedClassName}>
      <code
        className={`hljs language-${highlighted.lang}`}
        dangerouslySetInnerHTML={{ __html: highlighted.html }}
      />
    </pre>
  );
}

function escapeHtml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
