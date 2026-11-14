import React from 'react';
import { Github, Package, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-8 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Text-only wordmark — no logo image, no SVG monogram */}
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Zettly Editor</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              v0.3.0
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Distraction-free rich text editor for React.
            </span>
          </div>

          <div className="flex items-center gap-5 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
            <a
              href="https://github.com/programinglive/zettly-editor"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
            <a
              href="https://www.npmjs.com/package/@programinglive/zettly-editor"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <Package className="w-3.5 h-3.5" />
              <span>npm</span>
            </a>
            <a
              href="https://github.com/programinglive/zettly-editor/issues"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <span>Issues</span>
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </a>
            <a
              href="https://github.com/programinglive/zettly-editor/blob/main/LICENSE"
              target="_blank"
              rel="noreferrer"
              className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              MIT License
            </a>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-500 gap-2">
          <p>© {new Date().getFullYear()} ProgramingLive. All rights reserved.</p>
          <p>Built with React, TipTap &amp; ProseMirror.</p>
        </div>
      </div>
    </footer>
  );
};
