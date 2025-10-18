import { useEffect, useMemo, useRef, useState } from "react";
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
  const [html, setHtml] = useState<string | null>(null);
  const [langUsed, setLangUsed] = useState<string>("xml");
  const idleIdRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    setHtml(null);
    const requestedLang = language.toLowerCase();

    const run = () => {
      ensureLanguageRegistered(requestedLang);
      const lang = hljs.getLanguage(requestedLang) ? requestedLang : "xml";
      try {
        const { value } = hljs.highlight(code, { language: lang });
        setHtml(value);
        setLangUsed(lang);
      } catch (error) {
        setHtml(escapeHtml(code));
        setLangUsed("xml");
      }
    };

    const ric = (window as any).requestIdleCallback as undefined | ((cb: (deadline: any) => void, opts?: { timeout?: number }) => number);
    if (ric) {
      idleIdRef.current = ric(() => {
        idleIdRef.current = null;
        run();
      }, { timeout: 120 });
    } else {
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        setTimeout(run, 0);
      });
    }

    return () => {
      const cic = (window as any).cancelIdleCallback as undefined | ((id: number) => void);
      if (cic && idleIdRef.current != null) cic(idleIdRef.current);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      idleIdRef.current = null;
      rafRef.current = null;
    };
  }, [code, language]);

  const combinedClassName = [
    "hljs max-h-72 overflow-auto rounded-xl p-4 text-xs leading-6 transition-colors",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const outputHtml = html ?? escapeHtml(code);
  const langClass = html ? langUsed : "plain";
  return (
    <pre className={combinedClassName}>
      <code
        className={`hljs language-${langClass}`}
        dangerouslySetInnerHTML={{ __html: outputHtml }}
      />
    </pre>
  );
}

function escapeHtml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
