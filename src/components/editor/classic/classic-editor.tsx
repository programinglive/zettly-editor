import * as React from "react";
import type { Editor } from "@tiptap/core";
import { EditorContent } from "@tiptap/react";

import { cn } from "../../../lib/utils";
import type {
  CommandDefinition,
  EditorMessages,
  EditorPermissions,
  ToolbarRenderProps,
  DebugEvent,
} from "../../../types/editor";
import { DefaultToolbar } from "../toolbar";

export interface ClassicEditorProps {
  editor: Editor;
  commands: CommandDefinition[];
  permissions: EditorPermissions;
  messages: EditorMessages;
  toolbar?: (props: ToolbarRenderProps) => React.ReactNode;
  className?: string;
  editorClassName?: string;
  debug: boolean;
  onDebugEvent?: (event: DebugEvent) => void;
  onToggleDebug: (next: boolean) => void;
  onImageUpload?: (file: File) => Promise<string>;
  version: string;
}

export const ClassicEditor: React.FC<ClassicEditorProps> = ({
  editor,
  commands,
  permissions,
  messages,
  toolbar,
  className,
  editorClassName,
  debug,
  onDebugEvent,
  onToggleDebug,
  onImageUpload,
  version,
}) => {
  const renderToolbar = React.useCallback(
    (props: ToolbarRenderProps) => {
      if (toolbar) {
        return toolbar(props);
      }
      return <DefaultToolbar {...props} />;
    },
    [toolbar]
  );

  const toolbarProps: ToolbarRenderProps = {
    editor,
    commands,
    permissions,
    messages,
    debug,
    onDebugEvent,
    onToggleDebug,
    onImageUpload,
  };

  const handleSurfaceMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && editor) {
      event.preventDefault();
      editor.commands.focus("end");
    }
  };

  return (
    <div
      data-zettly-editor-root=""
      data-preset="classic"
      className={cn("overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm", className)}
    >
      <div data-zettly-editor-toolbar="" className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
        {renderToolbar(toolbarProps)}
      </div>

      <div
        data-zettly-editor-surface=""
        className={cn("relative px-4 py-4 min-h-[220px]", editorClassName)}
        onMouseDown={handleSurfaceMouseDown}
      >
        {debug && (
          <div className="absolute right-4 top-4 z-10 select-none rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-600 shadow-sm ring-1 ring-red-200 animate-pulse">
            Debug Mode
          </div>
        )}
        <EditorContent
          editor={editor}
          className={cn(
            "min-h-[200px] w-full text-base leading-relaxed focus:outline-none",
            "[&_p]:mb-4 [&_p:last-child]:mb-0 [&_h1]:mb-4 [&_h2]:mb-4 [&_h3]:mb-3",
            "[&_ul]:ml-6 [&_ul]:list-disc [&_ul]:space-y-1",
            "[&_ol]:ml-6 [&_ol]:list-decimal [&_ol]:space-y-1",
            "[&_li]:marker:text-muted-foreground",
            "[&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-muted [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
            "[&_a]:text-primary [&_a]:underline [&_a:hover]:text-primary/80",
            "[&_.ProseMirror]:min-h-[200px] [&_.ProseMirror]:w-full [&_.ProseMirror]:outline-none [&_.ProseMirror]:border-0 [&_.ProseMirror]:shadow-none",
            "[&_.ProseMirror-focused]:outline-none [&_.ProseMirror-focused]:border-0 [&_.ProseMirror-focused]:shadow-none",
            "[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md [&_img]:border [&_img]:border-border"
          )}
        />
      </div>

      <div
        data-zettly-editor-footer=""
        className="flex items-center justify-between border-t border-border/60 bg-background/70 px-3 py-2 text-xs text-muted-foreground"
      >
        <span>Zettly Editor v{version}</span>
        <span>Debug {debug ? "Enabled" : "Disabled"}</span>
      </div>
    </div>
  );
};
