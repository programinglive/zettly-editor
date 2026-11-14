import * as React from "react";
import type { Editor } from "@tiptap/core";
import { EditorContent } from "@tiptap/react";

import { cn } from "../../../lib/utils";
import type { EditorPermissions } from "../../../types/editor";
import { BubbleToolbar } from "./bubble-toolbar";
import { SlashCommandMenu } from "./slash-command-menu";
import { FloatingBlockInserter } from "./floating-block-inserter";
import type { BlockCommandRegistry } from "../../../commands/block-command-registry";

export interface MediumEditorProps {
  editor: Editor;
  permissions?: EditorPermissions;
  registry?: BlockCommandRegistry;
  className?: string;
  editorClassName?: string;
  debug?: boolean;
}

export const MediumEditor: React.FC<MediumEditorProps> = ({
  editor,
  permissions = {},
  registry,
  className,
  editorClassName,
  debug,
}) => {
  return (
    <div
      data-zettly-editor-root=""
      className={cn(
        "relative w-full max-w-2xl mx-auto py-6 px-4 sm:px-6 transition-all",
        "bg-transparent text-slate-900 dark:text-slate-100",
        className
      )}
    >
      {debug && (
        <div className="absolute right-4 top-2 select-none rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-600 shadow-sm ring-1 ring-red-200">
          Zettly Editor · Debug
        </div>
      )}

      {/* Contextual Floating Bubble Toolbar on Selection */}
      <BubbleToolbar
        editor={editor}
        allowLinks={permissions.allowLinks !== false && !permissions.readOnly}
      />

      {/* Floating '+' Inserter on Empty Lines */}
      {!permissions.readOnly && (
        <FloatingBlockInserter editor={editor} registry={registry} />
      )}

      {/* Slash Command Popover ('/' trigger) */}
      {!permissions.readOnly && (
        <SlashCommandMenu editor={editor} registry={registry} />
      )}

      {/* Content Area */}
      <div
        data-zettly-editor-surface=""
        className={cn("w-full focus:outline-none", editorClassName)}
      >
        <EditorContent
          editor={editor}
          className={cn(
            "min-h-[300px] w-full text-lg leading-relaxed focus:outline-none",
            "[&_p]:mb-6 [&_p:last-child]:mb-0",
            "[&_h1]:mb-6 [&_h1]:mt-8 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:tracking-tight [&_h1:first-child]:mt-0",
            "[&_h2]:mb-4 [&_h2]:mt-6 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight",
            "[&_h3]:mb-3 [&_h3]:mt-5 [&_h3]:text-xl [&_h3]:font-semibold",
            "[&_ul]:mb-6 [&_ul]:ml-6 [&_ul]:list-disc [&_ul]:space-y-2",
            "[&_ol]:mb-6 [&_ol]:ml-6 [&_ol]:list-decimal [&_ol]:space-y-2",
            "[&_blockquote]:my-6 [&_blockquote]:border-l-[3px] [&_blockquote]:border-indigo-500 [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-xl [&_blockquote]:text-slate-700 dark:[&_blockquote]:text-slate-200",
            "[&_a]:text-indigo-600 dark:[&_a]:text-indigo-400 [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:opacity-80",
            "[&_code:not(pre_code)]:rounded [&_code:not(pre_code)]:bg-slate-100 dark:[&_code:not(pre_code)]:bg-slate-800 [&_code:not(pre_code)]:px-1.5 [&_code:not(pre_code)]:py-0.5 [&_code:not(pre_code)]:text-sm [&_code:not(pre_code)]:font-mono",
            "[&_.ProseMirror]:min-h-[300px] [&_.ProseMirror]:w-full [&_.ProseMirror]:outline-none [&_.ProseMirror]:border-0 [&_.ProseMirror]:shadow-none",
            "[&_.ProseMirror-focused]:outline-none [&_.ProseMirror-focused]:border-0 [&_.ProseMirror-focused]:shadow-none",
            "[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:shadow-sm [&_img]:my-6"
          )}
        />
      </div>
    </div>
  );
};
