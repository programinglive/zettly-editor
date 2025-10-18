import * as React from "react";
import type { Editor } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import CharacterCount from "@tiptap/extension-character-count";

import { cn } from "../../lib/utils";
import {
  type EditorMessages,
  type EditorMeta,
  type ToolbarRenderProps,
  type ZettlyEditorProps,
} from "../../types/editor";
import { defaultCommands } from "./default-commands";
import {
  EditorContextProvider,
  useEditorContext,
  defaultMessages,
} from "./editor-context";
import { DefaultToolbar } from "./toolbar";

const computeMeta = (editor: Editor): EditorMeta => {
  const characterStorage = editor.storage.characterCount as {
    characters: () => number;
    words: () => number;
  };

  const characters = characterStorage?.characters?.() ?? editor.state.doc.nodeSize - 2;
  const words = characterStorage?.words?.() ?? editor.state.doc.textContent.trim().split(/\s+/).filter(Boolean).length;

  return {
    characters,
    words,
    empty: editor.state.doc.textContent.length === 0,
    flowState: editor.isEditable ? "idle" : "info",
  };
};

interface EditorShellProps extends ZettlyEditorProps {
  commands: Required<ZettlyEditorProps>["commands"];
  permissions: NonNullable<ZettlyEditorProps["permissions"]>;
  messages: EditorMessages;
}

const EditorShell: React.FC<EditorShellProps> = ({
  value,
  onChange,
  extensions,
  commands,
  permissions,
  messages,
  toolbar,
  className,
  editorClassName,
  autoFocus = false,
}) => {
  const { setMeta, createCommandContext } = useEditorContext();
  const lastValueRef = React.useRef(value);
  const skipNextEmitRef = React.useRef(false);

  const mergedExtensions = React.useMemo(
    () => [
      StarterKit.configure({}),
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" } }),
      Placeholder.configure({ placeholder: messages.placeholder }),
      CharacterCount.configure({ limit: undefined }),
      ...(extensions ?? []),
    ],
    [extensions, messages.placeholder]
  );

  const editor = useEditor(
    {
      extensions: mergedExtensions,
      content: value,
      editable: permissions.readOnly !== true,
      onCreate({ editor: createdEditor }) {
        const meta = computeMeta(createdEditor);
        setMeta(meta);
        if (autoFocus) {
          window.requestAnimationFrame(() => {
            createdEditor.commands.focus("end");
          });
        }
      },
      onUpdate({ editor: updatedEditor }) {
        if (skipNextEmitRef.current) {
          skipNextEmitRef.current = false;
          return;
        }
        const meta = computeMeta(updatedEditor);
        const html = updatedEditor.getHTML();
        lastValueRef.current = html;
        setMeta(meta);
        onChange(html, meta);
      },
    },
    [mergedExtensions, permissions.readOnly]
  );

  React.useEffect(() => {
    if (!editor) {
      return;
    }
    const incoming = value;
    if (incoming !== lastValueRef.current) {
      skipNextEmitRef.current = true;
      editor.commands.setContent(incoming, false, { preserveWhitespace: true });
      lastValueRef.current = incoming;
      const meta = computeMeta(editor);
      setMeta(meta);
    }
  }, [editor, value, setMeta]);

  React.useEffect(() => {
    if (!editor) {
      return;
    }
    editor.setEditable(permissions.readOnly !== true);
  }, [editor, permissions.readOnly]);

  const renderToolbar = React.useCallback(
    (props: ToolbarRenderProps) => {
      if (toolbar) {
        return toolbar(props);
      }
      return <DefaultToolbar {...props} />;
    },
    [toolbar]
  );

  if (!editor) {
    return null;
  }

  const toolbarProps: ToolbarRenderProps = {
    editor,
    commands,
    permissions,
    messages,
  };

  return (
    <div className={cn("flex flex-col gap-2 rounded-lg border border-border bg-background", className)}>
      {renderToolbar(toolbarProps)}
      <div className={cn("min-h-[200px] rounded-lg border border-input bg-background p-4", editorClassName)}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export const ZettlyEditor: React.FC<ZettlyEditorProps> = (props) => {
  const {
    value,
    onChange,
    commands = defaultCommands,
    permissions = {},
    messages = {},
    ...rest
  } = props;

  const mergedMessages = React.useMemo<EditorMessages>(
    () => ({ ...defaultMessages, ...messages }),
    [messages]
  );
  const normalizedPermissions = React.useMemo(
    () => ({ allowLinks: true, readOnly: false, ...permissions }),
    [permissions]
  );

  return (
    <EditorContextProvider
      value={value}
      onChange={onChange}
      commands={commands}
      permissions={normalizedPermissions}
      messages={mergedMessages}
    >
      <EditorShell
        value={value}
        onChange={onChange}
        commands={commands}
        permissions={normalizedPermissions}
        messages={mergedMessages}
        {...rest}
      />
    </EditorContextProvider>
  );
};
