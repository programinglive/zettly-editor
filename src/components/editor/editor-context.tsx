import * as React from "react";

import {
  type CommandDefinition,
  type CommandContext,
  type EditorMessages,
  type EditorMeta,
  type EditorPermissions,
  type EditorValueSync,
} from "../../types/editor";

interface EditorContextValue extends EditorValueSync {
  commands: CommandDefinition[];
  permissions: EditorPermissions;
  messages: EditorMessages;
  meta: EditorMeta;
  setMeta: (meta: EditorMeta) => void;
  createCommandContext: (editor: CommandContext["editor"]) => CommandContext;
}

const defaultMessages: EditorMessages = {
  placeholder: "Start typing...",
  linkPrompt: "Enter URL",
  success: "Content saved",
  warning: "Check formatting",
  error: "An error occurred",
  info: "Editor toolbar",
};

const EditorContext = React.createContext<EditorContextValue | undefined>(undefined);

export const useEditorContext = () => {
  const value = React.useContext(EditorContext);
  if (!value) {
    throw new Error("useEditorContext must be used within ZettlyEditorContextProvider");
  }
  return value;
};

interface EditorContextProviderProps extends EditorValueSync {
  commands: CommandDefinition[];
  permissions: EditorPermissions;
  messages: EditorMessages;
  children: React.ReactNode;
}

export const EditorContextProvider: React.FC<EditorContextProviderProps> = ({
  children,
  value,
  onChange,
  commands,
  permissions,
  messages,
}) => {
  const [meta, setMeta] = React.useState<EditorMeta>({
    characters: value.length,
    words: value.trim().split(/\s+/).filter(Boolean).length,
    empty: value.length === 0,
    flowState: "idle",
  });

  const mergedMessages = React.useMemo(() => ({ ...defaultMessages, ...messages }), [messages]);

  const normalizedPermissions = React.useMemo(() => ({ allowLinks: true, ...permissions }), [permissions]);

  const createCommandContext = React.useCallback(
    (editor: CommandContext["editor"]) => ({
      editor,
      permissions: normalizedPermissions,
    }),
    [normalizedPermissions]
  );

  const contextValue = React.useMemo<EditorContextValue>(
    () => ({
      value,
      onChange,
      commands,
      permissions: normalizedPermissions,
      messages: mergedMessages,
      meta,
      setMeta,
      createCommandContext,
    }),
    [value, onChange, commands, normalizedPermissions, mergedMessages, meta, createCommandContext]
  );

  return <EditorContext.Provider value={contextValue}>{children}</EditorContext.Provider>;
};

export { defaultMessages };
