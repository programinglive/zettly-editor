import * as React from "react";
import type { Editor } from "@tiptap/core";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Quote,
  Link as LinkIcon,
  Code,
  Check,
  X,
  Unlink,
} from "lucide-react";

import { cn } from "../../../lib/utils";

export interface BubbleToolbarProps {
  editor: Editor;
  allowLinks?: boolean;
}

export const BubbleToolbar: React.FC<BubbleToolbarProps> = ({
  editor,
  allowLinks = true,
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [position, setPosition] = React.useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [isLinkMode, setIsLinkMode] = React.useState(false);
  const [linkUrl, setLinkUrl] = React.useState("");
  const toolbarRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const updatePosition = React.useCallback(() => {
    if (!editor || editor.isDestroyed || !editor.view) {
      setIsVisible(false);
      return;
    }

    const { selection } = editor.state;
    const { from, to, empty } = selection;

    // Show only when text is actively selected
    if (empty || !editor.isEditable || from === to) {
      setIsVisible(false);
      setIsLinkMode(false);
      return;
    }

    try {
      const view = editor.view;
      const start = view.coordsAtPos(from);
      const end = view.coordsAtPos(to);

      // Center above selection
      const left = Math.max(16, (start.left + end.left) / 2);
      const top = Math.min(start.top, end.top) - 10;

      setPosition({ top, left });
      setIsVisible(true);
    } catch {
      setIsVisible(false);
    }
  }, [editor]);

  React.useEffect(() => {
    if (!editor) return;

    editor.on("selectionUpdate", updatePosition);
    editor.on("transaction", updatePosition);
    editor.on("blur", updatePosition);

    return () => {
      editor.off("selectionUpdate", updatePosition);
      editor.off("transaction", updatePosition);
      editor.off("blur", updatePosition);
    };
  }, [editor, updatePosition]);

  // Keyboard shortcut listener for Mod+K and Escape
  React.useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (isLinkMode) {
          setIsLinkMode(false);
        } else {
          setIsVisible(false);
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k" && allowLinks) {
        e.preventDefault();
        const currentLink = editor.getAttributes("link")?.href || "";
        setLinkUrl(currentLink);
        setIsLinkMode(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, isLinkMode, allowLinks, editor]);

  // Focus input when link mode opens
  React.useEffect(() => {
    if (isLinkMode && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isLinkMode]);

  const handleOpenLink = () => {
    const currentLink = editor.getAttributes("link")?.href || "";
    setLinkUrl(currentLink);
    setIsLinkMode(true);
  };

  const handleApplyLink = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = linkUrl.trim();
    if (!trimmed) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      let finalUrl = trimmed;
      if (!/^(https?:\/\/|mailto:|tel:)/i.test(finalUrl)) {
        finalUrl = `https://${finalUrl}`;
      }
      editor.chain().focus().extendMarkRange("link").setLink({ href: finalUrl }).run();
    }
    setIsLinkMode(false);
  };

  const handleRemoveLink = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setIsLinkMode(false);
  };

  if (!isVisible) return null;

  return (
    <div
      ref={toolbarRef}
      role="toolbar"
      aria-label="Contextual formatting options"
      data-zettly-bubble-toolbar=""
      style={{
        position: "fixed",
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: "translate(-50%, -100%)",
      }}
      className={cn(
        "z-50 flex items-center gap-0.5 rounded-full px-2 py-1 shadow-xl",
        "bg-slate-900/95 text-white backdrop-blur-md dark:bg-slate-800/95",
        "border border-slate-700/60 dark:border-slate-600/60",
        "animate-in fade-in zoom-in-95 duration-150 select-none"
      )}
    >
      {isLinkMode ? (
        <form onSubmit={handleApplyLink} className="flex items-center gap-1 px-1 py-0.5">
          <input
            ref={inputRef}
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Paste URL (e.g. https://...)"
            aria-label="Link URL input"
            className="w-48 bg-transparent px-2 py-1 text-xs text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            onClick={handleApplyLink}
            aria-label="Apply link"
            className="rounded-full p-1 text-emerald-400 hover:bg-slate-800 hover:text-emerald-300"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          {editor.isActive("link") && (
            <button
              type="button"
              onClick={handleRemoveLink}
              aria-label="Remove link"
              className="rounded-full p-1 text-rose-400 hover:bg-slate-800 hover:text-rose-300"
            >
              <Unlink className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsLinkMode(false)}
            aria-label="Cancel link editing"
            className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </form>
      ) : (
        <>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            aria-label="Bold"
            aria-pressed={editor.isActive("bold")}
            className={cn(
              "rounded-full p-1.5 transition-colors hover:bg-slate-800 hover:text-white",
              editor.isActive("bold") ? "bg-slate-800 text-indigo-400" : "text-slate-300"
            )}
          >
            <Bold className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            aria-label="Italic"
            aria-pressed={editor.isActive("italic")}
            className={cn(
              "rounded-full p-1.5 transition-colors hover:bg-slate-800 hover:text-white",
              editor.isActive("italic") ? "bg-slate-800 text-indigo-400" : "text-slate-300"
            )}
          >
            <Italic className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            aria-label="Strikethrough"
            aria-pressed={editor.isActive("strike")}
            className={cn(
              "rounded-full p-1.5 transition-colors hover:bg-slate-800 hover:text-white",
              editor.isActive("strike") ? "bg-slate-800 text-indigo-400" : "text-slate-300"
            )}
          >
            <Strikethrough className="h-4 w-4" />
          </button>

          <div className="mx-1 h-4 w-px bg-slate-700" />

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            aria-label="Heading 2"
            aria-pressed={editor.isActive("heading", { level: 2 })}
            className={cn(
              "rounded-full p-1.5 transition-colors hover:bg-slate-800 hover:text-white",
              editor.isActive("heading", { level: 2 }) ? "bg-slate-800 text-indigo-400" : "text-slate-300"
            )}
          >
            <Heading2 className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            aria-label="Blockquote"
            aria-pressed={editor.isActive("blockquote")}
            className={cn(
              "rounded-full p-1.5 transition-colors hover:bg-slate-800 hover:text-white",
              editor.isActive("blockquote") ? "bg-slate-800 text-indigo-400" : "text-slate-300"
            )}
          >
            <Quote className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            aria-label="Inline Code"
            aria-pressed={editor.isActive("code")}
            className={cn(
              "rounded-full p-1.5 transition-colors hover:bg-slate-800 hover:text-white",
              editor.isActive("code") ? "bg-slate-800 text-indigo-400" : "text-slate-300"
            )}
          >
            <Code className="h-4 w-4" />
          </button>

          {allowLinks && (
            <>
              <div className="mx-1 h-4 w-px bg-slate-700" />
              <button
                type="button"
                onClick={handleOpenLink}
                aria-label="Link"
                aria-pressed={editor.isActive("link")}
                className={cn(
                  "rounded-full p-1.5 transition-colors hover:bg-slate-800 hover:text-white",
                  editor.isActive("link") ? "bg-slate-800 text-indigo-400" : "text-slate-300"
                )}
              >
                <LinkIcon className="h-4 w-4" />
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
};
