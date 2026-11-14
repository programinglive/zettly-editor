import React from "react";
import { Terminal, Copy, Check, ArrowDown, Sparkles } from "lucide-react";

export const Hero: React.FC = () => {
  const [copied, setCopied] = React.useState(false);
  const installCmd = "npm install @programinglive/zettly-editor";

  const handleCopy = () => {
    navigator.clipboard.writeText(installCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToPlayground = () => {
    document.querySelector("#playground")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-10 sm:pt-12 sm:pb-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/60 bg-indigo-50/80 px-3 py-1 text-xs font-semibold text-indigo-700 shadow-2xs backdrop-blur-xs transition dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            <span>Open Source · MIT Licensed · React 18 & 19 Compatible</span>
          </div>

          {/* Headline */}
          <h1 className="mt-4 max-w-3xl text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-5xl lg:text-5xl dark:text-zinc-50 leading-[1.12]">
            Writing should feel <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">effortless.</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-600 sm:text-base dark:text-zinc-400">
            A distraction-free, customizable WYSIWYG rich text editor for React.
            Combines the clean elegance of Medium with the headless extensibility of TipTap.
          </p>

          {/* Copyable Installation & Actions */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center rounded-xl border border-zinc-200/90 bg-zinc-900 text-zinc-100 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-mono">
                <Terminal className="h-3.5 w-3.5 text-zinc-400" />
                <span>{installCmd}</span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 border-l border-zinc-800 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                title="Copy installation command"
                aria-label="Copy installation command"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={scrollToPlayground}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer"
            >
              <span>Try Playground</span>
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Micro capability badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              Contextual Bubble Toolbar
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
              Slash Commands Palette (<kbd className="rounded bg-zinc-100 px-1 py-0.2 font-mono dark:bg-zinc-800">/</kbd>)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              Margin Inserter (<kbd className="rounded bg-zinc-100 px-1 py-0.2 font-mono dark:bg-zinc-800">+</kbd>)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Zero CSS Framework Leakage
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
