import React from 'react';
import { Layers, ShieldCheck, Cpu } from 'lucide-react';

const API_PROPS = [
  {
    name: 'preset',
    type: "'medium' | 'classic'",
    default: "'medium'",
    description: "Choose 'medium' for the distraction-free contextual writing UI, or 'classic' for traditional fixed toolbar.",
  },
  {
    name: 'content',
    type: 'string',
    default: "''",
    description: 'Initial document HTML string passed to TipTap.',
  },
  {
    name: 'onChange',
    type: '(html: string) => void',
    default: 'undefined',
    description: 'Callback invoked on document changes returning the updated HTML markup.',
  },
  {
    name: 'placeholder',
    type: 'string',
    default: "'Type something...'",
    description: 'Placeholder text displayed when the document is empty.',
  },
  {
    name: 'editable',
    type: 'boolean',
    default: 'true',
    description: 'Whether the editor allows editing or acts as a read-only viewer.',
  },
  {
    name: 'className',
    type: 'string',
    default: "''",
    description: 'Custom CSS classes applied to the root editor wrapper.',
  },
];

export const DeveloperGuide: React.FC = () => {
  return (
    <section id="developer-guide" className="py-16 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Developer Documentation
          </h2>
          <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            A concise API designed to fit existing React codebases with zero friction.
          </p>
        </div>

        {/* Preset Comparison */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-500" />
            <span>Preset Comparison: Medium vs Classic</span>
          </h3>
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900/80 text-zinc-900 dark:text-zinc-100 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Feature</th>
                  <th className="py-3 px-4">Medium Preset (Recommended)</th>
                  <th className="py-3 px-4">Classic Preset</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-600 dark:text-zinc-400">
                <tr>
                  <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">Formatting Chrome</td>
                  <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-medium">Contextual Bubble Menu (auto-floating)</td>
                  <td className="py-3 px-4">Top Fixed Static Toolbar</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">Block Insertion</td>
                  <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-medium">Gutter '+' Button &amp; '/' Slash Palette</td>
                  <td className="py-3 px-4">Static Toolbar Dropdowns</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">Visual Aesthetic</td>
                  <td className="py-3 px-4">Clean editorial layout, distraction-free typography</td>
                  <td className="py-3 px-4">Standard CMS/document editor style</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">Use Case</td>
                  <td className="py-3 px-4">Publishing apps, blogs, notes, documentation</td>
                  <td className="py-3 px-4">Legacy forms, structured data admin panels</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* API Props Table */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-indigo-500" />
            <span>&lt;ZettlyEditor /&gt; Props</span>
          </h3>
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900/80 text-zinc-900 dark:text-zinc-100 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Prop</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Default</th>
                  <th className="py-3 px-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono text-xs">
                {API_PROPS.map((prop, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                    <td className="py-3 px-4 font-semibold text-indigo-600 dark:text-indigo-400">{prop.name}</td>
                    <td className="py-3 px-4 text-zinc-800 dark:text-zinc-200">{prop.type}</td>
                    <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400">{prop.default}</td>
                    <td className="py-3 px-4 font-sans text-xs text-zinc-600 dark:text-zinc-400">{prop.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quality & Compatibility Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
            <div className="flex items-center space-x-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Strict Zero-Vulnerability</h4>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Audited with automated dependency security quality gates. 0 production audit vulnerabilities and clean tree verification.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
            <div className="flex items-center space-x-2 mb-2">
              <Cpu className="w-5 h-5 text-indigo-500" />
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">React 18 &amp; 19 Ready</h4>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Tested against both React 18 and React 19 canary releases without duplicate ProseMirror instance split or hydration issues.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
            <div className="flex items-center space-x-2 mb-2">
              <Layers className="w-5 h-5 text-purple-500" />
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Full Dual Packaging</h4>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Strict package exports map supporting both standard ESM bundlers (Vite, Next.js, Rollup) and legacy CommonJS environments.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
