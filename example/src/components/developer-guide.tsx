import React, { useState } from 'react';
import { Layers, ShieldCheck, Cpu, Feather, MessageSquareQuote, Slash, Table, BookOpen } from 'lucide-react';

const API_PROPS = [
  {
    name: 'value',
    type: 'string',
    default: 'required',
    description: 'Controlled document HTML markup string passed to the editor.',
  },
  {
    name: 'onChange',
    type: '(value: string, meta: EditorMeta) => void',
    default: 'required',
    description: 'Callback invoked on content changes with updated HTML and word/character telemetry.',
  },
  {
    name: 'preset',
    type: "'medium' | 'classic'",
    default: "'medium'",
    description: "Distraction-free contextual writing UI ('medium') or traditional fixed top toolbar ('classic').",
  },
  {
    name: 'messages',
    type: 'Partial<EditorMessages>',
    default: "{ placeholder: 'Start typing...' }",
    description: 'Customizable UI copy and empty-document placeholder text.',
  },
  {
    name: 'permissions',
    type: 'EditorPermissions',
    default: '{ readOnly: false, allowLinks: true }',
    description: 'Controls read-only viewer state and link creation permissions.',
  },
  {
    name: 'blockRegistry',
    type: 'BlockCommandRegistry',
    default: 'defaultBlockRegistry',
    description: "Custom block command registry for '/' slash commands and '+' gutter insertion.",
  },
  {
    name: 'onImageUpload',
    type: '(file: File) => Promise<string>',
    default: 'undefined',
    description: 'Async handler for image uploads returning the resolved image URL.',
  },
  {
    name: 'className',
    type: 'string',
    default: 'undefined',
    description: 'Custom CSS class string applied to the root editor wrapper container.',
  },
];

const FEATURES = [
  {
    icon: Feather,
    title: 'Distraction-Free Editorial Flow',
    description:
      'Inspired by Medium. Typography takes center stage with balanced line heights, comfortable line length, and an interface that fades away while writing.',
    badge: 'Medium Preset',
  },
  {
    icon: MessageSquareQuote,
    title: 'Contextual Selection Toolbar',
    description:
      'Format in-flow without static headers. Select text to reveal bold, italic, code, links, and heading transforms anchored directly above your cursor.',
    badge: 'Bubble Menu',
  },
  {
    icon: Slash,
    title: 'Slash Commands & Gutter Inserter',
    description:
      'Type "/" on an empty line or click the subtle hover "+" button in the margin to insert headings, blockquotes, code fences, and bullet lists.',
    badge: 'Keyboard-First',
  },
  {
    icon: Cpu,
    title: 'TipTap 3 & ProseMirror Foundation',
    description:
      'Built on battle-tested ProseMirror primitives. Strict TypeScript types, React 18 & 19 peer support, and clean semantic HTML serialization.',
    badge: 'Extensible Core',
  },
];

export const DeveloperGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'api' | 'features' | 'architecture'>('api');

  return (
    <section id="docs" className="py-8 sm:py-10 bg-zinc-50 dark:bg-zinc-900/40 border-t border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-2xl">
              Developer Documentation
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              API props reference, preset comparison, and core architectural features.
            </p>
          </div>

          {/* Segmented Tab Controls */}
          <div className="inline-flex rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-0.5 text-xs font-medium shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab('api')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition cursor-pointer ${
                activeTab === 'api'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>API &amp; Presets</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('features')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition cursor-pointer ${
                activeTab === 'features'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Feather className="w-3.5 h-3.5" />
              <span>Features</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition cursor-pointer ${
                activeTab === 'architecture'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Architecture</span>
            </button>
          </div>
        </div>

        {/* Tab 1: API Props & Presets */}
        {activeTab === 'api' && (
          <div className="space-y-6">
            {/* Props Table */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-2xs">
              <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950/60 border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                &lt;ZettlyEditor /&gt; Component Props
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50/50 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="py-2.5 px-3.5">Prop</th>
                      <th className="py-2.5 px-3.5">Type</th>
                      <th className="py-2.5 px-3.5">Default</th>
                      <th className="py-2.5 px-3.5">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">
                    {API_PROPS.map((prop, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                        <td className="py-2.5 px-3.5 font-semibold text-indigo-600 dark:text-indigo-400">{prop.name}</td>
                        <td className="py-2.5 px-3.5 text-zinc-800 dark:text-zinc-200">{prop.type}</td>
                        <td className="py-2.5 px-3.5 text-zinc-500">{prop.default}</td>
                        <td className="py-2.5 px-3.5 font-sans text-xs text-zinc-600 dark:text-zinc-400">{prop.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Presets Table */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-2xs">
              <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950/60 border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                Preset Comparison: Medium vs Classic
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50/50 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="py-2.5 px-3.5">Capability</th>
                      <th className="py-2.5 px-3.5">Medium Preset (Default)</th>
                      <th className="py-2.5 px-3.5">Classic Preset</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs text-zinc-600 dark:text-zinc-400">
                    <tr>
                      <td className="py-2.5 px-3.5 font-medium text-zinc-900 dark:text-zinc-100">Toolbar Interface</td>
                      <td className="py-2.5 px-3.5 text-emerald-600 dark:text-emerald-400 font-medium">Contextual Floating Bubble Menu</td>
                      <td className="py-2.5 px-3.5">Static Top Toolbar</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3.5 font-medium text-zinc-900 dark:text-zinc-100">Block Inserter</td>
                      <td className="py-2.5 px-3.5 text-emerald-600 dark:text-emerald-400 font-medium">Gutter '+' Button &amp; '/' Slash Palette</td>
                      <td className="py-2.5 px-3.5">Static Toolbar Dropdown</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3.5 font-medium text-zinc-900 dark:text-zinc-100">Layout &amp; Styling</td>
                      <td className="py-2.5 px-3.5">Distraction-free prose typography</td>
                      <td className="py-2.5 px-3.5">Standard document editing box</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Key Features */}
        {activeTab === 'features' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FEATURES.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {feature.title}
                      </h3>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      {feature.badge}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed pl-8">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: Architecture & Security */}
        {activeTab === 'architecture' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
              <div className="flex items-center space-x-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">Zero Known Vulnerabilities</h4>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Audited against automated dependency quality gates. Clean tree verification and zero production CVEs.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
              <div className="flex items-center space-x-2 mb-2">
                <Cpu className="w-4 h-4 text-indigo-500" />
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">React 18 &amp; 19 Ready</h4>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Tested across React 18.2.0 and React 19 canary releases without duplicate ProseMirror instance splits.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
              <div className="flex items-center space-x-2 mb-2">
                <Layers className="w-4 h-4 text-purple-500" />
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">Dual Packaging (ESM &amp; CJS)</h4>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                First-class support for Vite, Next.js, and legacy CommonJS bundlers via explicit exports maps.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
