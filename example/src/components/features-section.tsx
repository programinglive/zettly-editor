import React from 'react';
import { Feather, MessageSquareQuote, Slash, Cpu } from 'lucide-react';

const FEATURES = [
  {
    icon: Feather,
    title: 'Distraction-Free Editorial Flow',
    description:
      'Inspired by Medium. Typography takes center stage with balanced line heights, generous line length constraints, and an interface that fades away while writing.',
    badge: 'Medium Preset',
  },
  {
    icon: MessageSquareQuote,
    title: 'Contextual Selection Toolbar',
    description:
      'Format in-flow without reaching for static headers. Select text to reveal bold, italic, inline code, links, and heading transforms anchored directly above your cursor.',
    badge: 'Smart Bubble Menu',
  },
  {
    icon: Slash,
    title: 'Slash Commands & Gutter Inserter',
    description:
      'Type "/" on an empty line or click the subtle hover "+" button to instantly insert headings, blockquotes, code fences, and bullet lists without breaking rhythm.',
    badge: 'Keyboard-First',
  },
  {
    icon: Cpu,
    title: 'Modern TipTap 2 & ProseMirror Foundation',
    description:
      'Built on battle-tested ProseMirror primitives. Full TypeScript strict typing, React 18/19 peer support, zero memory leaks, and clean semantic HTML/JSON output.',
    badge: 'Extensible Core',
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-16 bg-zinc-50 dark:bg-zinc-900/40 border-t border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Engineered for High-Velocity Writing
          </h2>
          <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            Everything you need for a modern content editor, without bloated toolbars or heavy runtime dependencies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all hover:shadow-sm"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {feature.badge}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
