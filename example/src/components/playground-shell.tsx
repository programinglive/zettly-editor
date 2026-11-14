import React, { useState } from "react";
import {
  RotateCcw,
  Code2,
  Eye,
  Edit3,
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
  Highlight any text to summon the floating bubble toolbar. Or type <kbd>/</kbd> on an empty line
  to insert blocks, or click the <kbd>+</kbd> button in the margin.
</p>
<ul>
  <li>Clean editorial typography with comfortable reading line-length</li>
  <li>Instant block commands palette with keyboard navigation</li>
  <li>Full backward compatibility with classic toolbar layout</li>
</ul>
<pre><code class="language-typescript">// Minimal React integration
import { ZettlyEditor } from "@programinglive/zettly-editor";
import "@programinglive/zettly-editor/styles";

export function NoteEditor() {
  const [content, setContent] = React.useState("<p>Hello world</p>");
  return &lt;ZettlyEditor value={content} onChange={setContent} preset="medium" /&gt;;
}</code></pre>`;

export interface PlaygroundShellProps {
  onDebugEvent?: (event: DebugEvent) => void;
}

export const PlaygroundShell: React.FC<PlaygroundShellProps> = () => {
  const [value, setValue] = useState(defaultPlaygroundContent);
  const [preset, setPreset] = useState<EditorPreset>("medium");
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [words, setWords] = useState(0);
  const [characters, setCharacters] = useState(0);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  const handleReset = () => {
    setValue(defaultPlaygroundContent);
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(value);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  return (
    <section id="playground" className="pt-2 pb-8 sm:pt-4 sm:pb-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Editor Shell Container */}
        <div className="overflow-hidden rounded-xl border border-zinc-200/90 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 transition-colors">
          {/* Functional Editor Toolbar Header (No decorative macOS dots) */}
          <div className="flex flex-wrap items-center justify-between border-b border-zinc-100 bg-zinc-50/70 px-3.5 py-2 dark:border-zinc-800/80 dark:bg-zinc-950/60 gap-2.5">
            {/* Left: Preset Switcher + Mode */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Preset Switcher */}
              <div className="inline-flex items-center rounded-lg border border-zinc-200 bg-white p-0.5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 text-xs">
                <button
                  type="button"
                  onClick={() => setPreset("medium")}
                  className={`rounded-md px-2.5 py-1 font-medium transition cursor-pointer ${
                    preset === "medium"
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                  }`}
                  aria-pressed={preset === "medium"}
                >
                  Medium Preset
                </button>
                <button
                  type="button"
                  onClick={() => setPreset("classic")}
                  className={`rounded-md px-2.5 py-1 font-medium transition cursor-pointer ${
                    preset === "classic"
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                  }`}
                  aria-pressed={preset === "classic"}
                >
                  Classic Toolbar
                </button>
              </div>

              {/* Edit / Preview Segmented Switch */}
              <div className="inline-flex items-center rounded-lg border border-zinc-200 bg-white p-0.5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 text-xs">
                <button
                  type="button"
                  onClick={() => setMode("edit")}
                  className={`flex items-center gap-1 rounded-md px-2 py-1 font-medium transition cursor-pointer ${
                    mode === "edit"
                      ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
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
                      ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
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
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-600 shadow-2xs transition hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 cursor-pointer"
                title="Reset to sample content"
                aria-label="Reset content"
              >
                <RotateCcw className="h-3 w-3" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>

            {/* Right: Telemetry & Inspector toggle */}
            <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="hidden sm:inline font-mono">{words} words · {characters} chars</span>
              <button
                type="button"
                onClick={() => setInspectorOpen((p) => !p)}
                className="flex items-center gap-1 font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <Code2 className="h-3.5 w-3.5" />
                <span className="text-[11px]">{inspectorOpen ? "Hide Output" : "Inspect HTML"}</span>
                {inspectorOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            </div>
          </div>

          {/* Medium Contextual Hint Banner */}
          {preset === "medium" && mode === "edit" && (
            <div className="border-b border-zinc-100 bg-zinc-50/50 px-4 py-1.5 text-[11px] text-zinc-600 dark:border-zinc-800/80 dark:bg-zinc-950/40 dark:text-zinc-400 flex items-center justify-between">
              <div>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">Medium Mode:</span> Highlight text to format, or type <kbd className="rounded bg-white px-1 py-0.2 font-mono shadow-2xs dark:bg-zinc-800 text-[10px]">/</kbd> on any line to insert blocks.
              </div>
            </div>
          )}

          {/* Editor Body Surface */}
          <div className="min-h-[340px] p-4 sm:p-6 sm:py-6">
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
              />
            ) : (
              <article className="prose prose-zinc dark:prose-invert max-w-2xl mx-auto py-2">
                <div
                  className="space-y-4 text-base leading-relaxed text-zinc-800 dark:text-zinc-100 [&_a]:text-indigo-600 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-indigo-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-semibold [&_li]:list-disc [&_ul]:pl-5 [&_ol]:pl-5 [&_pre]:rounded-xl [&_pre]:bg-zinc-100 [&_pre]:p-4 dark:[&_pre]:bg-zinc-950 [&_code]:font-mono [&_code]:text-xs"
                  dangerouslySetInnerHTML={{ __html: value }}
                />
              </article>
            )}
          </div>

          {/* Collapsible Developer Output Inspector Drawer */}
          {inspectorOpen && (
            <div className="border-t border-zinc-200 bg-zinc-900 text-zinc-100 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                  <Code2 className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Serialized Output (HTML)</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyHtml}
                  className="flex items-center gap-1 text-xs text-zinc-400 transition hover:text-zinc-200 cursor-pointer"
                  aria-label="Copy HTML output"
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
              <pre className="max-h-48 overflow-y-auto p-4 font-mono text-xs text-zinc-300 select-all leading-relaxed whitespace-pre-wrap break-all">
                {value}
              </pre>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
