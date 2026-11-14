import React from "react";
import {
  RotateCcw,
  Code2,
  Eye,
  Edit3,
  Bug,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  ZettlyEditor,
  type DebugEvent,
  type EditorPreset,
} from "@programinglive/zettly-editor";

export const defaultPlaygroundContent = `<h1>The Art of Distraction-Free Writing</h1>
<p>
  Writing is thinking. When you are formulating an idea, a draft, or technical documentation,
  your tools should fade into the background. The best interfaces are the ones that never interrupt your flow.
</p>
<blockquote>
  “Simplicity is about subtracting the obvious and adding the meaningful.” — John Maeda
</blockquote>
<h2>Contextual Editing in Action</h2>
<p>
  Try highlighting any sentence to summon the floating bubble toolbar. Or place your cursor on an empty line
  and type <kbd>/</kbd> to insert blocks, or click the <kbd>+</kbd> button in the margin.
</p>
<ul>
  <li>Clean prose typography with comfortable reading line-length</li>
  <li>Instant block commands palette with fuzzy search</li>
  <li>Full backward compatibility with traditional top toolbar</li>
</ul>
<h2>Code Snippets with Syntax Highlighting</h2>
<pre><code class="language-typescript">// Embed Zettly Editor into your React application
import { ZettlyEditor } from "@programinglive/zettly-editor";
import "@programinglive/zettly-editor/styles";

export function PostEditor() {
  const [content, setContent] = React.useState("<p>Hello world</p>");
  return &lt;ZettlyEditor value={content} onChange={setContent} preset="medium" /&gt;;
}</code></pre>
<p>Start editing this document to explore the live reactive state below.</p>`;

export interface PlaygroundShellProps {
  onDebugEvent?: (event: DebugEvent) => void;
}

export const PlaygroundShell: React.FC<PlaygroundShellProps> = () => {
  const [value, setValue] = React.useState(defaultPlaygroundContent);
  const [preset, setPreset] = React.useState<EditorPreset>("medium");
  const [mode, setMode] = React.useState<"edit" | "preview">("edit");
  const [words, setWords] = React.useState(0);
  const [characters, setCharacters] = React.useState(0);
  const [debugEnabled, setDebugEnabled] = React.useState(false);
  const [inspectorOpen, setInspectorOpen] = React.useState(false);
  const [copiedHtml, setCopiedHtml] = React.useState(false);

  const handleReset = () => {
    setValue(defaultPlaygroundContent);
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(value);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  return (
    <section id="playground" className="py-6 sm:py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section title & description */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl dark:text-zinc-50">
              Interactive Editor Playground
            </h2>
            <p className="mt-1 text-xs text-zinc-600 sm:text-sm dark:text-zinc-400">
              Test drive both presets running live on the published package.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Instance
            </span>
          </div>
        </div>

        {/* macOS Window Frame */}
        <div className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900 transition-colors">
          {/* Window Chrome Header */}
          <div className="flex flex-wrap items-center justify-between border-b border-zinc-100 bg-zinc-50/80 px-4 py-2.5 dark:border-zinc-800/80 dark:bg-zinc-950/60 gap-3">
            {/* Window control dots + title */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>
              <span className="ml-2 text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400 hidden sm:inline">
                story-editor.tsx
              </span>
            </div>

            {/* Controls: Preset Switcher + Mode + Reset */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Preset Switcher */}
              <div className="inline-flex items-center rounded-lg border border-zinc-200 bg-white p-0.5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 text-xs">
                <button
                  type="button"
                  onClick={() => setPreset("medium")}
                  className={`rounded-md px-2.5 py-1 font-medium transition cursor-pointer ${
                    preset === "medium"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                  }`}
                  aria-pressed={preset === "medium"}
                >
                  Medium (Clean)
                </button>
                <button
                  type="button"
                  onClick={() => setPreset("classic")}
                  className={`rounded-md px-2.5 py-1 font-medium transition cursor-pointer ${
                    preset === "classic"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                  }`}
                  aria-pressed={preset === "classic"}
                >
                  Classic (Toolbar)
                </button>
              </div>

              {/* Edit / Preview Segmented Switch */}
              <div className="inline-flex items-center rounded-lg border border-zinc-200 bg-white p-0.5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 text-xs">
                <button
                  type="button"
                  onClick={() => setMode("edit")}
                  className={`flex items-center gap-1 rounded-md px-2 py-1 font-medium transition cursor-pointer ${
                    mode === "edit"
                      ? "bg-zinc-900 text-white dark:bg-zinc-800"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
                  }`}
                  aria-pressed={mode === "edit"}
                >
                  <Edit3 className="h-3 w-3" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode("preview")}
                  className={`flex items-center gap-1 rounded-md px-2 py-1 font-medium transition cursor-pointer ${
                    mode === "preview"
                      ? "bg-zinc-900 text-white dark:bg-zinc-800"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
                  }`}
                  aria-pressed={mode === "preview"}
                >
                  <Eye className="h-3 w-3" />
                  <span>Preview</span>
                </button>
              </div>

              {/* Reset Content Button */}
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg border border-zinc-200 bg-white p-1.5 text-zinc-600 shadow-2xs transition hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 cursor-pointer"
                title="Reset to default content"
                aria-label="Reset content"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>

              {/* Debug toggle */}
              <button
                type="button"
                onClick={() => setDebugEnabled((p) => !p)}
                className={`rounded-lg border p-1.5 transition shadow-2xs cursor-pointer ${
                  debugEnabled
                    ? "border-red-300 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400"
                    : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                }`}
                title="Toggle debug events stream"
                aria-label="Toggle debug mode"
              >
                <Bug className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Medium Contextual Hint Banner */}
          {preset === "medium" && mode === "edit" && (
            <div className="border-b border-indigo-100/80 bg-indigo-50/50 px-4 py-2 text-xs text-indigo-900 dark:border-indigo-950/60 dark:bg-indigo-950/20 dark:text-indigo-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-indigo-700 dark:text-indigo-400">💡 Medium mode:</span>
                <span>Highlight text for floating bubble menu, or type <kbd className="rounded bg-white px-1.5 py-0.5 font-mono shadow-xs dark:bg-zinc-800">/</kbd> on any line to insert blocks.</span>
              </div>
            </div>
          )}

          {/* Editor Body Surface */}
          <div className="min-h-[460px] p-4 sm:p-8">
            {mode === "edit" ? (
              <ZettlyEditor
                preset={preset}
                value={value}
                onChange={(nextValue, meta) => {
                  setValue(nextValue);
                  setWords(meta.words);
                  setCharacters(meta.characters);
                }}
                messages={{ placeholder: "Start typing your story..." }}
                debug={debugEnabled}
              />
            ) : (
              <article className="prose prose-zinc dark:prose-invert max-w-2xl mx-auto py-4">
                <div
                  className="space-y-4 text-base leading-relaxed text-zinc-800 dark:text-zinc-100 [&_a]:text-indigo-600 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-indigo-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:text-2xl [&_h2]:font-semibold [&_li]:list-disc [&_ul]:pl-5 [&_ol]:pl-5 [&_pre]:rounded-xl [&_pre]:bg-zinc-100 [&_pre]:p-4 dark:[&_pre]:bg-zinc-950 [&_code]:font-mono [&_code]:text-xs"
                  dangerouslySetInnerHTML={{ __html: value }}
                />
              </article>
            )}
          </div>

          {/* Playground Footer Status Bar */}
          <div className="flex flex-wrap items-center justify-between border-t border-zinc-100 bg-zinc-50/80 px-4 py-2 text-xs text-zinc-500 dark:border-zinc-800/80 dark:bg-zinc-950/60 dark:text-zinc-400">
            <div className="flex items-center gap-4">
              <span>{words} words</span>
              <span>•</span>
              <span>{characters} characters</span>
              <span>•</span>
              <span className="capitalize">{preset} preset</span>
            </div>

            <button
              type="button"
              onClick={() => setInspectorOpen((p) => !p)}
              className="flex items-center gap-1 font-medium text-zinc-600 transition hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 cursor-pointer"
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>{inspectorOpen ? "Hide Output HTML" : "Inspect HTML"}</span>
              {inspectorOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          </div>

          {/* Collapsible Developer Output Inspector */}
          {inspectorOpen && (
            <div className="border-t border-zinc-200 bg-zinc-900 p-4 text-zinc-100 dark:border-zinc-800 animate-in slide-in-from-top-1 duration-150">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Document HTML Snapshot
                  </span>
                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">
                    {value.length} bytes
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyHtml}
                  className="flex items-center gap-1 rounded bg-zinc-800 px-2.5 py-1 text-xs text-zinc-200 transition hover:bg-zinc-700"
                >
                  {copiedHtml ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy HTML</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="max-h-56 overflow-auto rounded-lg bg-zinc-950 p-3 text-xs font-mono text-zinc-300 leading-relaxed">
                {value}
              </pre>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
