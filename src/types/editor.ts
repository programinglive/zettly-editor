import { type AnyExtension, type Editor } from "@tiptap/core";
import type { EditorState } from "@tiptap/pm/state";
import { type ReactNode } from "react";

export type EditorFlowState = "idle" | "loading" | "success" | "warning" | "error" | "info";

export interface EditorMeta {
  characters: number;
  words: number;
  empty: boolean;
  flowState: EditorFlowState;
}

export interface EditorMessages {
  placeholder: string;
  linkPrompt: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export type EditorSelectionJSON = ReturnType<EditorState["selection"]["toJSON"]>;

interface DebugEventBase {
  timestamp: number;
}

export type DebugEvent =
  | (DebugEventBase & {
      type: "create";
      selection: EditorSelectionJSON;
      html: string;
      meta: EditorMeta;
    })
  | (DebugEventBase & {
      type: "update";
      selection: EditorSelectionJSON;
      html: string;
      meta: EditorMeta;
      skipped: boolean;
    })
  | (DebugEventBase & {
      type: "transaction";
      selection: EditorSelectionJSON;
      transaction: {
        docChanged: boolean;
        stepCount: number;
        selectionSet: boolean;
      };
    })
  | (DebugEventBase & {
      type: "selectionUpdate";
      selection: EditorSelectionJSON;
    })
  | (DebugEventBase & {
      type: "toolbarUpdate";
      selection: EditorSelectionJSON;
      activeCommands: string[];
    })
  | (DebugEventBase & {
      type: "error";
      message: string;
      context?: string;
    });

export interface EditorPermissions {
  readOnly?: boolean;
  allowLinks?: boolean;
}

export interface CommandContext {
  editor: Editor;
  permissions: EditorPermissions;
}

export interface CommandDefinition {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  group?: string;
  icon?: ReactNode;
  type: "toggle" | "button";
  isActive?: (context: CommandContext) => boolean;
  isEnabled?: (context: CommandContext) => boolean;
  run: (context: CommandContext) => void;
}

export interface EditorValueSync {
  value: string;
  onChange: (value: string, meta: EditorMeta) => void;
}

export interface ToolbarRenderProps {
  editor: Editor;
  commands: CommandDefinition[];
  permissions: EditorPermissions;
  messages: EditorMessages;
  debug: boolean;
  onDebugEvent?: (event: DebugEvent) => void;
  onToggleDebug?: (next: boolean) => void;
}

export interface ZettlyEditorProps extends EditorValueSync {
  extensions?: AnyExtension[];
  commands?: CommandDefinition[];
  permissions?: EditorPermissions;
  messages?: Partial<EditorMessages>;
  toolbar?: (props: ToolbarRenderProps) => ReactNode;
  className?: string;
  editorClassName?: string;
  autoFocus?: boolean;
  debug?: boolean;
  onDebugEvent?: (event: DebugEvent) => void;
  onDebugToggle?: (next: boolean) => void;
}
