import React, { useState } from "react";
import { Terminal, Copy, Check, ArrowRight, BookOpen } from "lucide-react";

export const Hero: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const installCmd = "npm i @programinglive/zettly-editor";

  const handleCopy = () => {
    navigator.clipboard.writeText(installCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToPlayground = () => {
    document.querySelector("#playground")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToDocs = () => {
    document.querySelector("#docs")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative pt-6 pb-6 sm:pt-8 sm:pb-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-0.5 text-xs font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            <span>React 18 &amp; 19</span>
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
            <span>TypeScript Strict</span>
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
            <span>Zero Vulnerability</span>
          </div>

          {/* Primary Heading */}
          <h1 className="mt-3 max-w-3xl text-2xl font-bold tracking-tight text-zinc-950 sm:text-4xl lg:text-4xl dark:text-zinc-50">
            Write beautifully. Build effortlessly.
          </h1>

          {/* Supporting Description */}
          <p className="mt-2.5 max-w-2xl text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            A clean, powerful rich-text editor for React. Inspired by Medium, built for developers.
          </p>

          {/* Compact Actions & Install */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={scrollToPlayground}
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white cursor-pointer"
            >
              <span>Try Playground</span>
              <ArrowRight className="h-3 w-3" />
            </button>

            <button
              type="button"
              onClick={scrollToDocs}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
            >
              <BookOpen className="h-3 w-3 text-zinc-400" />
              <span>Documentation</span>
            </button>

            {/* Quick Copy Command */}
            <div className="flex items-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-mono">
                <Terminal className="h-3 w-3 text-zinc-400" />
                <span>{installCmd}</span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 border-l border-zinc-200 dark:border-zinc-800 px-2.5 py-1.5 text-[11px] font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                title="Copy installation command"
                aria-label="Copy installation command"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-sans">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span className="font-sans">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
