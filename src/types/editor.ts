import { type AnyExtension, type Editor } from "@tiptap/core";
import type { EditorState } from "@tiptap/pm/state";
import { type ReactNode } from "react";
import type { BlockCommandRegistry } from "../commands/block-command-registry";
import type { ZettlyDocumentV1 } from "./document";

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
    type: "error";
    message: string;
    context?: string;
  });

export interface EditorPermissions {
  readOnly?: boolean;
  allowLinks?: boolean;
  allowImages?: boolean;
}

export interface CommandContext {
  editor: Editor;
  permissions: EditorPermissions;
  onImageUpload?: (file: File) => Promise<string>;
}

export interface CommandSelectOption {
  value: string;
  label: string;
}

interface BaseCommandDefinition {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  group?: string;
  icon?: ReactNode;
  isActive?: (context: CommandContext) => boolean;
  isEnabled?: (context: CommandContext) => boolean;
  run: (context: CommandContext, value?: string) => void;
}

export interface ToggleCommandDefinition extends BaseCommandDefinition {
  type: "toggle";
  isActive?: (context: CommandContext) => boolean;
}

export interface ButtonCommandDefinition extends BaseCommandDefinition {
  type: "button";
}

export interface SelectCommandDefinition extends BaseCommandDefinition {
  type: "select";
  options: CommandSelectOption[];
  placeholder?: string;
  getValue?: (context: CommandContext) => string | undefined;
}

export type CommandDefinition =
  | ToggleCommandDefinition
  | ButtonCommandDefinition
  | SelectCommandDefinition;

export interface EditorValueSync {
  value: string;
  onChange: (value: string, meta: EditorMeta) => void;
}

/**
 * Canonical props contract for `ZettlyEditor` (Modern-Only v1.0.0 Public API).
 */
export interface ZettlyEditorProps extends EditorValueSync {
  /** Custom block command registry for the contextual slash menu and floating `+` inserter. */
  blockRegistry?: BlockCommandRegistry;
  /** Additional TipTap extensions appended to the Modern-Only editor instance. */
  extensions?: AnyExtension[];
  /**
   * @deprecated Legacy Classic toolbar prop retained as a no-op compile-time shim in v1.0.0.
   * Use `blockRegistry` for custom contextual block commands instead. Scheduled for removal in v2.0.0.
   */
  commands?: CommandDefinition[];
  permissions?: EditorPermissions;
  messages?: Partial<EditorMessages>;
  className?: string;
  editorClassName?: string;
  autoFocus?: boolean;
  debug?: boolean;
  onDebugEvent?: (event: DebugEvent) => void;
  /**
   * @deprecated Legacy Classic toolbar toggle callback retained as a no-op shim in v1.0.0.
   * Scheduled for removal in v2.0.0.
   */
  onDebugToggle?: (next: boolean) => void;
  onImageUpload?: (file: File) => Promise<string>;
  /** Callback receiving a normalized `ZettlyDocumentV1` JSON AST on every document change. */
  onJsonChange?: (doc: ZettlyDocumentV1) => void;
}
