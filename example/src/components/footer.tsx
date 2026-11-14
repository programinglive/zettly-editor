import React from 'react';
import { Github, Package, ExternalLink, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-12 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              Z
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Zettly Editor</span>
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  v0.3.0
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Modern distraction-free rich text editor for React.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
            <a
              href="https://github.com/programinglive/zettly-editor"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
            <a
              href="https://www.npmjs.com/package/@programinglive/zettly-editor"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <Package className="w-4 h-4" />
              <span>npm Package</span>
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

        <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 gap-3">
          <p>© {new Date().getFullYear()} ProgramingLive. All rights reserved.</p>
          <p className="flex items-center space-x-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for frictionless developer writing experiences.</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
