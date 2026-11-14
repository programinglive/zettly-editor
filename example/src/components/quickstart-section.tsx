import React, { useState } from 'react';
import { Check, Copy, Terminal, Code2 } from 'lucide-react';

const INSTALL_COMMANDS = {
  npm: 'npm install @programinglive/zettly-editor',
  pnpm: 'pnpm add @programinglive/zettly-editor',
  yarn: 'yarn add @programinglive/zettly-editor',
};

const CODE_SNIPPET = `import React, { useState } from 'react';
import { ZettlyEditor } from '@programinglive/zettly-editor';
import '@programinglive/zettly-editor/style.css';

export function NoteEditor() {
  const [content, setContent] = useState('<p>Welcome to <strong>Zettly Editor</strong>.</p>');

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <ZettlyEditor
        preset="medium"
        content={content}
        onChange={setContent}
        placeholder="Type '/' for contextual commands..."
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
    <section id="installation" className="py-16 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Integrate in 60 Seconds
          </h2>
          <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            Plug-and-play rich text with zero required configuration. Drop in the React component and style with your own CSS or our minimal preset styles.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Installation & Package info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  <Terminal className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                  <span>Installation</span>
                </div>
                <div className="flex rounded-md bg-zinc-200/80 dark:bg-zinc-800 p-0.5 text-xs font-medium">
                  {(['npm', 'pnpm', 'yarn'] as const).map((pm) => (
                    <button
                      key={pm}
                      onClick={() => setActivePm(pm)}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        activePm === pm
                          ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      {pm}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between bg-zinc-900 text-zinc-100 dark:bg-zinc-950 rounded-lg p-3 font-mono text-xs sm:text-sm">
                <span className="truncate mr-2 select-all">{INSTALL_COMMANDS[activePm]}</span>
                <button
                  onClick={handleCopyCmd}
                  aria-label="Copy installation command"
                  className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors shrink-0"
                >
                  {copiedCmd ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">Published npm Release:</span>
                  <span className="font-mono text-zinc-900 dark:text-zinc-100 font-semibold">v0.3.0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">Peer Dependencies:</span>
                  <span className="font-mono text-zinc-900 dark:text-zinc-100">react &gt;= 18, react-dom</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">Bundle Format:</span>
                  <span className="font-mono text-zinc-900 dark:text-zinc-100">ESM + CJS (Dual build)</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 p-4 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              <span className="font-semibold block mb-1">Notice for v0.3.0 vs In-Dev Features:</span>
              The interactive playground above runs the latest verified <code className="bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded font-mono">main</code> build featuring M3 contextual floating menus and block insertion. npm package <code className="font-mono">v0.3.0</code> contains stable M2 Medium preset functionality.
            </div>
          </div>

          {/* Right Column: Code Snippet */}
          <div className="lg:col-span-7">
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-900 dark:bg-zinc-950 shadow-md overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-800/80 dark:bg-zinc-900/80 border-b border-zinc-700/60">
                <div className="flex items-center space-x-2 text-xs font-medium text-zinc-300">
                  <Code2 className="w-4 h-4 text-indigo-400" />
                  <span className="font-mono">NoteEditor.tsx</span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center space-x-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors py-1 px-2 rounded hover:bg-zinc-700/50"
                  aria-label="Copy React code snippet"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy code</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono text-zinc-300 leading-relaxed">
                <code>{CODE_SNIPPET}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
