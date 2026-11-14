import * as React from "react";
import type { Editor } from "@tiptap/core";
import { useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Link } from "@tiptap/extension-link";
import { Highlight } from "@tiptap/extension-highlight";
import { CharacterCount } from "@tiptap/extension-character-count";
import { BulletList } from "@tiptap/extension-bullet-list";
import { OrderedList } from "@tiptap/extension-ordered-list";
import { ListItem } from "@tiptap/extension-list-item";
import { Blockquote } from "@tiptap/extension-blockquote";
import { Image } from "@tiptap/extension-image";

import { CodeBlockWithSyntaxHighlight } from "./code-block-config";
import "./code-highlight.css";
import "./zettly-editor.css";
import {
  type EditorMessages,
  type EditorMeta,
  type ZettlyEditorProps,
} from "../../types/editor";
import { defaultCommands } from "./default-commands";
import {
  EditorContextProvider,
  useEditorContext,
  defaultMessages,
} from "./editor-context";
import { MediumEditor } from "./medium/medium-editor";
import { ClassicEditor } from "./classic/classic-editor";
import { emitDebugEvent, type DebugEventInput } from "./debug-utils";
import { ZETTLY_EDITOR_VERSION } from "../../version";
import { normalizeToDocumentV1, createEmptyDocument } from "../../core/document-validator";

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
  const sanitizedText = textContent.replace(/\s/g, "").replace(/\u200b|\u200c|\u200d|\u2060|\ufeff/g, "");
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
  preset = "medium",
  blockRegistry,
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
  onDebugToggle,
  onImageUpload,
  onJsonChange,
}) => {
  const { setMeta } = useEditorContext();
  const lastValueRef = React.useRef(value);
  const skipNextEmitRef = React.useRef(false);
  const serializationScheduledRef = React.useRef(false);

  // Allow toolbar to toggle debug even if consumer didn't provide onDebugToggle
  const [internalDebug, setInternalDebug] = React.useState(debug);
  React.useEffect(() => {
    setInternalDebug(debug);
  }, [debug]);
  const effectiveDebug = onDebugToggle ? debug : internalDebug;
  const handleToggleDebug = React.useCallback(
    (next: boolean) => {
      if (onDebugToggle) {
        onDebugToggle(next);
      } else {
        setInternalDebug(next);
      }
    },
    [onDebugToggle]
  );

  const emit = React.useCallback(
    (event: DebugEventInput) => {
      emitDebugEvent(effectiveDebug, onDebugEvent, event);
    },
    [effectiveDebug, onDebugEvent]
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
    if (onJsonChange) {
      try {
        onJsonChange(normalizeToDocumentV1(ed.getJSON()) ?? createEmptyDocument());
      } catch {
        // Safe fallback
      }
    }
  }, [onChange, onJsonChange, setMeta]);

  const mergedExtensions = React.useMemo(
    () => [
      StarterKit.configure({
        codeBlock: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        blockquote: false,
        link: false,
      }),
      BulletList,
      OrderedList,
      ListItem,
      Blockquote,
      CodeBlockWithSyntaxHighlight,
      Highlight.configure({
        multicolor: true,
      }),
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" } }),
      Image,
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
      editorProps: {
        handlePaste: (view, event) => {
          if (!onImageUpload) return false;
          const items = Array.from(event.clipboardData?.items || []);
          const imageItem = items.find((item) => item.type.indexOf("image") === 0);

          if (imageItem) {
            const file = imageItem.getAsFile();
            if (file) {
              event.preventDefault();
              onImageUpload(file).then((url) => {
                view.dispatch(view.state.tr.replaceSelectionWith(
                  view.state.schema.nodes.image.create({ src: url })
                ));
              });
              return true;
            }
          }
          return false;
        },
        handleDrop: (view, event, slice, moved) => {
          if (!onImageUpload || moved) return false;
          const items = Array.from(event.dataTransfer?.items || []);
          const imageItem = items.find((item) => item.type.indexOf("image") === 0);

          if (imageItem) {
            const file = imageItem.getAsFile();
            if (file) {
              event.preventDefault();
              const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
              onImageUpload(file).then((url) => {
                if (coordinates) {
                  view.dispatch(view.state.tr.insert(
                    coordinates.pos,
                    view.state.schema.nodes.image.create({ src: url })
                  ));
                }
              });
              return true;
            }
          }
          return false;
        }
      },
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
              if (updatedEditor.isDestroyed || !updatedEditor.view) {
                return;
              }
              try {
                const html = updatedEditor.getHTML();
                lastValueRef.current = html;
                onChange(html, meta);
                if (onJsonChange) {
                  onJsonChange(normalizeToDocumentV1(updatedEditor.getJSON()) ?? createEmptyDocument());
                }
              } catch {
                // Gracefully handle concurrent editor destruction during serialization
              }
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
    [emit, mergedExtensions, permissions.readOnly, onImageUpload]
  );

  React.useEffect(() => {
    if (!editor) {
      return;
    }
    const incoming = value;
    if (incoming !== lastValueRef.current) {
      skipNextEmitRef.current = true;
      editor.commands.setContent(incoming, {
        emitUpdate: false,
        parseOptions: { preserveWhitespace: true },
      });
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

  // All hooks are called before this early return
  if (!editor) {
    return null;
  }

  const isClassic = preset === "classic";

  if (isClassic) {
    return (
      <ClassicEditor
        editor={editor}
        commands={commands}
        permissions={permissions}
        messages={messages}
        toolbar={toolbar}
        className={className}
        editorClassName={editorClassName}
        debug={effectiveDebug}
        onDebugEvent={onDebugEvent}
        onToggleDebug={handleToggleDebug}
        onImageUpload={onImageUpload}
        version={ZETTLY_EDITOR_VERSION}
      />
    );
  }

  return (
    <MediumEditor
      editor={editor}
      permissions={permissions}
      registry={blockRegistry}
      className={className}
      editorClassName={editorClassName}
      debug={effectiveDebug}
    />
  );
}

export const ZettlyEditor: React.FC<ZettlyEditorProps> = (props) => {
  const {
    value,
    onChange,
    preset = "medium",
    blockRegistry,
    commands = defaultCommands,
    permissions = {},
    messages = {},
    debug = false,
    onDebugEvent,
    onDebugToggle,
    onImageUpload,
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
      onImageUpload={onImageUpload}
    >
      <EditorShell
        value={value}
        onChange={onChange}
        preset={preset}
        blockRegistry={blockRegistry}
        commands={commands}
        permissions={normalizedPermissions}
        messages={mergedMessages}
        debug={debug}
        onDebugEvent={onDebugEvent}
        onDebugToggle={onDebugToggle}
        onImageUpload={onImageUpload}
        {...rest}
      />
    </EditorContextProvider>
  );
};
