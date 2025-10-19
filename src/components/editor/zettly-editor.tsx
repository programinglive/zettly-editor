import * as React from "react";
import type { Editor } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import CharacterCount from "@tiptap/extension-character-count";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Blockquote from "@tiptap/extension-blockquote";

import { cn } from "../../lib/utils";
import { CodeBlockWithSyntaxHighlight } from "./code-block-config";
import "./code-highlight.css";
import "./zettly-editor.css";
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
import { emitDebugEvent, type DebugEventInput } from "./debug-utils";

const computeMeta = (editor: Editor): EditorMeta => {
  // Fast path: check TipTap's built-in isEmpty first to avoid DOM access
  if (editor.isEmpty) {
    return {
      characters: 0,
      words: 0,
      empty: true,
      flowState: editor.isEditable ? "idle" : "info",
    };
  }

  const characterStorage = editor.storage.characterCount as {
    characters: () => number;
    words: () => number;
  };

  const textContent = editor.state.doc.textContent;
  const sanitizedText = textContent.replace(/[\s\u200b\u200c\u200d\u2060\ufeff]/g, "");
  const empty = sanitizedText.length === 0;
  const characters = empty ? 0 : characterStorage?.characters?.() ?? sanitizedText.length;
  const words = empty
    ? 0
    : characterStorage?.words?.() ?? textContent.trim().split(/\s+/).filter(Boolean).length;

  return {
    characters,
    words,
    empty,
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
  debug = false,
  onDebugEvent,
}) => {
  const { setMeta, createCommandContext } = useEditorContext();
  const lastValueRef = React.useRef(value);
  const skipNextEmitRef = React.useRef(false);
  const serializationScheduledRef = React.useRef(false);

  const emit = React.useCallback(
    (event: DebugEventInput) => {
      emitDebugEvent(debug, onDebugEvent, event);
    },
    [debug, onDebugEvent]
  );

  const emitEmpty = React.useCallback((ed: Editor) => {
    const meta: EditorMeta = {
      characters: 0,
      words: 0,
      empty: true,
      flowState: ed.isEditable ? "idle" : "info",
    };
    lastValueRef.current = "";
    setMeta(meta);
    onChange("", meta);
  }, [onChange, setMeta]);

  const mergedExtensions = React.useMemo(
    () => [
      StarterKit.configure({
        codeBlock: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        blockquote: false,
      }),
      BulletList,
      OrderedList,
      ListItem,
      Blockquote,
      CodeBlockWithSyntaxHighlight,
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
        emit({
          type: "create",
          selection: createdEditor.state.selection.toJSON(),
          html: createdEditor.getHTML(),
          meta,
        });
        setMeta(meta);
        lastValueRef.current = value;
        if (autoFocus) {
          createdEditor.commands.focus("end");
        }
      },
      onUpdate({ editor: updatedEditor }) {
        const skipped = skipNextEmitRef.current;
        if (skipped) {
          skipNextEmitRef.current = false;
        }
        const meta = computeMeta(updatedEditor);
        emit({
          type: "update",
          selection: updatedEditor.state.selection.toJSON(),
          html: updatedEditor.getHTML(),
          meta,
          skipped,
        });
        if (skipped) {
          return;
        }
        setMeta(meta);
        if (meta.empty) {
          emitEmpty(updatedEditor);
        } else {
          // Only defer the expensive HTML serialization, not metadata
          if (!serializationScheduledRef.current) {
            serializationScheduledRef.current = true;
            setTimeout(() => {
              serializationScheduledRef.current = false;
              const html = updatedEditor.getHTML();
              lastValueRef.current = html;
              onChange(html, meta);
            }, 0);
          }
        }
      },
      onTransaction({ editor: txEditor, transaction }) {
        emit({
          type: "transaction",
          selection: txEditor.state.selection.toJSON(),
          transaction: {
            docChanged: transaction.docChanged,
            stepCount: transaction.steps.length,
            selectionSet: transaction.selectionSet === true,
          },
        });
        const meta = computeMeta(txEditor);
        if (meta.empty && lastValueRef.current !== "") {
          emitEmpty(txEditor);
        }
      },
      onSelectionUpdate({ editor: activeEditor }) {
        emit({
          type: "selectionUpdate",
          selection: activeEditor.state.selection.toJSON(),
        });
        // Only check for empty state change to avoid expensive meta computation on every selection
        if (activeEditor.isEmpty && lastValueRef.current !== "") {
          emitEmpty(activeEditor);
        }
      },
    },
    [emit, mergedExtensions, permissions.readOnly]
  );

  const handleSurfaceMouseDown = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!editor) {
        return;
      }
      const target = event.target as HTMLElement;
      const insideEditor = Boolean(target.closest(".ProseMirror"));
      if (!insideEditor) {
        event.preventDefault();
      }
      editor.chain().focus().run();
    },
    [editor]
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
    debug,
    onDebugEvent,
  };

  return (
    <div data-zettly-editor-root="" className={cn("overflow-hidden", className)}>
      <div data-zettly-editor-toolbar="" className="px-3 py-2">
        {renderToolbar(toolbarProps)}
      </div>
      <div
        data-zettly-editor-surface=""
        className={cn("px-4 py-4", editorClassName)}
        onMouseDown={handleSurfaceMouseDown}
      >
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
            "[&_.ProseMirror-focused]:outline-none [&_.ProseMirror-focused]:border-0 [&_.ProseMirror-focused]:shadow-none"
          )}
        />
      </div>
    </div>
  );
}

export const ZettlyEditor: React.FC<ZettlyEditorProps> = (props) => {
  const {
    value,
    onChange,
    commands = defaultCommands,
    permissions = {},
    messages = {},
    debug = false,
    onDebugEvent,
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
        debug={debug}
        onDebugEvent={onDebugEvent}
        {...rest}
      />
    </EditorContextProvider>
  );
};
