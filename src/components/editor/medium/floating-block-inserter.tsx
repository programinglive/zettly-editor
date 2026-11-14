import * as React from "react";
import type { Editor } from "@tiptap/core";
import { Plus } from "lucide-react";
import { BlockCommandRegistry, defaultBlockRegistry } from "../../../commands/block-command-registry";
import type { BlockCommandItem } from "../../../commands/types";
import { BlockMenuList } from "./block-menu-list";
import { cn } from "../../../lib/utils";

export interface FloatingBlockInserterProps {
  editor: Editor;
  registry?: BlockCommandRegistry;
}

export const FloatingBlockInserter: React.FC<FloatingBlockInserterProps> = ({
  editor,
  registry = defaultBlockRegistry,
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const selectedIndexRef = React.useRef(0);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [position, setPosition] = React.useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const containerRef = React.useRef<HTMLDivElement>(null);

  const allItems = React.useMemo(() => {
    return registry.getAll();
  }, [registry]);

  React.useEffect(() => {
    selectedIndexRef.current = 0;
    setSelectedIndex(0);
  }, [isMenuOpen]);

  const updateInserterPosition = React.useCallback(() => {
    if (!editor || editor.isDestroyed || !editor.view) {
      setIsVisible(false);
      setIsMenuOpen(false);
      return;
    }

    const { selection } = editor.state;
    const { $from, empty } = selection;

    if (!empty || !editor.isEditable) {
      setIsVisible(false);
      setIsMenuOpen(false);
      return;
    }

    // Only show on empty paragraph
    const isCurrentEmpty =
      $from.parent.type.name === "paragraph" && $from.parent.content.size === 0;

    if (isCurrentEmpty) {
      try {
        const coords = editor.view.coordsAtPos($from.pos);
        // Position in the left margin next to the empty line
        const left = Math.max(8, coords.left - 32);
        const top = coords.top + (coords.bottom - coords.top) / 2;

        setPosition({ top, left });
        setIsVisible(true);
      } catch {
        setIsVisible(false);
        setIsMenuOpen(false);
      }
    } else {
      setIsVisible(false);
      setIsMenuOpen(false);
    }
  }, [editor]);

  React.useEffect(() => {
    if (!editor) return;

    editor.on("selectionUpdate", updateInserterPosition);
    editor.on("transaction", updateInserterPosition);
    editor.on("blur", updateInserterPosition);

    return () => {
      editor.off("selectionUpdate", updateInserterPosition);
      editor.off("transaction", updateInserterPosition);
      editor.off("blur", updateInserterPosition);
    };
  }, [editor, updateInserterPosition]);

  // Close on Escape key
  React.useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        setIsMenuOpen(false);
        requestAnimationFrame(() => {
          editor.view?.focus?.();
        });
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        e.stopPropagation();
        const next = allItems.length ? (selectedIndexRef.current + 1) % allItems.length : 0;
        selectedIndexRef.current = next;
        setSelectedIndex(next);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();
        const next = allItems.length
          ? (selectedIndexRef.current - 1 + allItems.length) % allItems.length
          : 0;
        selectedIndexRef.current = next;
        setSelectedIndex(next);
      } else if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        const currentIdx = selectedIndexRef.current;
        if (allItems[currentIdx]) {
          allItems[currentIdx].execute(editor);
          setIsMenuOpen(false);
          requestAnimationFrame(() => {
            editor.view?.focus?.();
          });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isMenuOpen, allItems, editor]);

  const handleSelectItem = (item: BlockCommandItem) => {
    item.execute(editor);
    setIsMenuOpen(false);
    requestAnimationFrame(() => {
      editor.view?.focus?.();
    });
  };

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      data-zettly-block-inserter=""
      style={{
        position: "fixed",
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: "translateY(-50%)",
      }}
      className="z-40 select-none"
    >
      <button
        type="button"
        aria-label="Add block"
        aria-haspopup="dialog"
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen((prev) => !prev)}
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-150",
          "border-slate-300 bg-white text-slate-500 shadow-sm hover:border-slate-400 hover:text-slate-800",
          "dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-100",
          isMenuOpen && "rotate-45 border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
        )}
      >
        <Plus className="h-3.5 w-3.5 transition-transform" />
      </button>

      {isMenuOpen && (
        <div
          role="dialog"
          aria-label="Block insertion menu"
          data-zettly-block-menu=""
          className={cn(
            "absolute left-8 top-0 z-50 w-64 rounded-xl border border-slate-200 dark:border-slate-800",
            "bg-white/95 text-slate-900 shadow-2xl backdrop-blur-md dark:bg-slate-900/95 dark:text-slate-100",
            "animate-in fade-in zoom-in-95 duration-100"
          )}
        >
          <div className="border-b border-slate-100 dark:border-slate-800 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Insert Block
          </div>
          <BlockMenuList
            items={allItems}
            selectedIndex={selectedIndex}
            onSelect={handleSelectItem}
          />
        </div>
      )}
    </div>
  );
};
