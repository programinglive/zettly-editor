import * as React from "react";
import type { Editor } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import CharacterCount from "@tiptap/extension-character-count";

import { cn } from "../../lib/utils";
import { CodeBlockWithSyntaxHighlight } from "./code-block-config";
import "./code-highlight.css";
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

  const textContent = editor.state.doc.textContent;
  const sanitizedText = textContent.replace(/[\s\u200b\u200c\u200d\u2060\ufeff]/g, "");
  const empty = editor.isEmpty || sanitizedText.length === 0;
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
}) => {
  const { setMeta, createCommandContext } = useEditorContext();
  const lastValueRef = React.useRef(value);
  const skipNextEmitRef = React.useRef(false);
  const selectAllRef = React.useRef(false);

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
      }),
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
        if (meta.empty) {
          emitEmpty(updatedEditor);
        } else {
          const rawHtml = updatedEditor.getHTML();
          const html = rawHtml;
          lastValueRef.current = html;
          setMeta(meta);
          onChange(html, meta);
        }
      },
      onTransaction({ editor: txEditor }) {
        const meta = computeMeta(txEditor);
        if (meta.empty && lastValueRef.current !== "") {
          emitEmpty(txEditor);
        }
      },
      onSelectionUpdate({ editor: activeEditor }) {
        const meta = computeMeta(activeEditor);
        if (meta.empty && lastValueRef.current !== "") {
          emitEmpty(activeEditor);
        }
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

  React.useEffect(() => {
    if (!editor) {
      return;
    }

    const root = editor.view.dom as HTMLElement;
    const content = (root.querySelector('.ProseMirror') as HTMLElement) ?? root;
    const normalizeIfEmpty = () => {
      const meta = computeMeta(editor);
      if (meta.empty && lastValueRef.current !== "") {
        emitEmpty(editor);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Backspace" && event.key !== "Delete") {
        return;
      }
      setTimeout(normalizeIfEmpty, 0);
    };
    const handleKeyUp = () => {
      // In case the browser handled deletion internally
      setTimeout(normalizeIfEmpty, 0);
    };
    const handleInput = () => setTimeout(normalizeIfEmpty, 0);
    const handleCut = () => setTimeout(normalizeIfEmpty, 0);
    const handleBeforeInput = (e: InputEvent) => {
      const t = (e as any).inputType as string | undefined;
      if (t && t.startsWith("delete")) {
        setTimeout(normalizeIfEmpty, 0);
      }
    };

    root.addEventListener("keydown", handleKeyDown, { capture: true });
    root.addEventListener("keyup", handleKeyUp, { capture: true });
    root.addEventListener("input", handleInput, { capture: true });
    root.addEventListener("cut", handleCut, { capture: true });
    root.addEventListener("beforeinput", handleBeforeInput as any, { capture: true } as any);
    if (content !== root) {
      content.addEventListener("keydown", handleKeyDown, { capture: true });
      content.addEventListener("keyup", handleKeyUp, { capture: true });
      content.addEventListener("input", handleInput, { capture: true });
      content.addEventListener("cut", handleCut, { capture: true });
      content.addEventListener("beforeinput", handleBeforeInput as any, { capture: true } as any);
    }
    const observer = new MutationObserver(() => setTimeout(normalizeIfEmpty, 0));
    observer.observe(content, { childList: true, subtree: true, characterData: true });
    return () => {
      root.removeEventListener("keydown", handleKeyDown, { capture: true } as any);
      root.removeEventListener("keyup", handleKeyUp, { capture: true } as any);
      root.removeEventListener("input", handleInput, { capture: true } as any);
      root.removeEventListener("cut", handleCut, { capture: true } as any);
      root.removeEventListener("beforeinput", handleBeforeInput as any, { capture: true } as any);
      if (content !== root) {
        content.removeEventListener("keydown", handleKeyDown, { capture: true } as any);
        content.removeEventListener("keyup", handleKeyUp, { capture: true } as any);
        content.removeEventListener("input", handleInput, { capture: true } as any);
        content.removeEventListener("cut", handleCut, { capture: true } as any);
        content.removeEventListener("beforeinput", handleBeforeInput as any, { capture: true } as any);
      }
      observer.disconnect();
    };
  }, [editor, onChange, setMeta]);

  React.useEffect(() => {
    if (!editor) {
      return;
    }

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (!editor.isFocused) {
        return;
      }
      const key = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && key === "a") {
        selectAllRef.current = true;
        return;
      }
      if ((key === "backspace" || key === "delete") && selectAllRef.current) {
        e.preventDefault();
        window.requestAnimationFrame(() => {
          editor.commands.clearContent(true);
          const meta = computeMeta(editor);
          const html = meta.empty ? "" : editor.getHTML();
          lastValueRef.current = html;
          setMeta(meta);
          onChange(html, meta);
        });
        selectAllRef.current = false;
        return;
      }
      if (!e.metaKey && !e.ctrlKey) {
        selectAllRef.current = false;
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown, { capture: true });
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown, { capture: true } as any);
    };
  }, [editor, onChange, setMeta]);

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
    <div className={cn("overflow-hidden rounded-2xl border border-border bg-background shadow-sm", className)}>
      <div className="rounded-t-2xl border-b border-border/80 bg-background/90 px-3 py-2">
        {renderToolbar(toolbarProps)}
      </div>
      <div className={cn("rounded-b-2xl bg-background px-4 py-4", editorClassName)}>
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
