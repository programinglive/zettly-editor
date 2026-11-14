import React, { useState } from 'react';
import { Check, Copy, Terminal, Code2 } from 'lucide-react';
import { ZETTLY_EDITOR_VERSION } from '@programinglive/zettly-editor';

const INSTALL_COMMANDS = {
  npm: 'npm install @programinglive/zettly-editor',
  pnpm: 'pnpm add @programinglive/zettly-editor',
  yarn: 'yarn add @programinglive/zettly-editor',
};

const CODE_SNIPPET = `import React, { useState } from 'react';
import { ZettlyEditor } from '@programinglive/zettly-editor';
import '@programinglive/zettly-editor/styles';

export function NoteEditor() {
  const [content, setContent] = useState('<p>Hello world</p>');

  return (
    <div className="max-w-2xl mx-auto py-8">
      <ZettlyEditor
        value={content}
        onChange={(nextHtml) => setContent(nextHtml)}
        messages={{ placeholder: "Type '/' for contextual commands..." }}
      />
    </div>
  );
}`;

export const QuickstartSection: React.FC = () => {
  const [activePm, setActivePm] = useState<'npm' | 'pnpm' | 'yarn'>('npm');
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCmd = () => {
    navigator.clipboard.writeText(INSTALL_COMMANDS[activePm]);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(CODE_SNIPPET);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <section id="installation" className="py-8 sm:py-10 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-2xl">
              Quick Installation
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              Drop in the React component and start writing in minutes.
            </p>
          </div>
          <div className="text-xs text-zinc-500 font-mono">
            Peer: <span className="text-zinc-700 dark:text-zinc-300">react &gt;= 18.2.0</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Installation */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-4">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center space-x-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Package Manager</span>
                </div>
                <div className="flex rounded-md bg-zinc-200/70 dark:bg-zinc-800 p-0.5 text-xs font-medium">
                  {(['npm', 'pnpm', 'yarn'] as const).map((pm) => (
                    <button
                      key={pm}
                      onClick={() => setActivePm(pm)}
                      className={`px-2 py-0.5 rounded transition-colors text-[11px] cursor-pointer ${
                        activePm === pm
                          ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-2xs font-semibold'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      {pm}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between bg-zinc-900 text-zinc-100 dark:bg-zinc-950 rounded-lg p-2.5 font-mono text-xs">
                <span className="truncate mr-2 select-all">{INSTALL_COMMANDS[activePm]}</span>
                <button
                  onClick={handleCopyCmd}
                  aria-label="Copy installation command"
                  className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors shrink-0 cursor-pointer"
                >
                  {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="mt-3 pt-3 border-t border-zinc-200/80 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1">
                <div className="flex justify-between">
                  <span>Published npm Release:</span>
                  <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">v{ZETTLY_EDITOR_VERSION}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bundle Format:</span>
                  <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">ESM + CJS</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Import <code className="font-mono text-zinc-700 dark:text-zinc-300">@programinglive/zettly-editor/styles</code> in your app entry. The editor includes styles for the modern contextual editor and responds to dark mode automatically.
            </p>
          </div>

          {/* Right Column: Code Snippet */}
          <div className="lg:col-span-7">
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-900 dark:bg-zinc-950 shadow-xs overflow-hidden">
              <div className="flex items-center justify-between px-3.5 py-2 bg-zinc-800/70 dark:bg-zinc-900/80 border-b border-zinc-700/50">
                <div className="flex items-center space-x-2 text-xs font-medium text-zinc-300">
                  <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-mono">NoteEditor.tsx</span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center space-x-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors py-0.5 px-1.5 rounded hover:bg-zinc-700/50 cursor-pointer"
                  aria-label="Copy React code snippet"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 text-[11px]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span className="text-[11px]">Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3.5 overflow-x-auto text-xs font-mono text-zinc-300 leading-relaxed">
                <code>{CODE_SNIPPET}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
