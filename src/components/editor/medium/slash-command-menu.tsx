import * as React from "react";
import type { Editor } from "@tiptap/core";
import { BlockCommandRegistry, defaultBlockRegistry } from "../../../commands/block-command-registry";
import type { BlockCommandItem } from "../../../commands/types";
import { BlockMenuList } from "./block-menu-list";
import { cn } from "../../../lib/utils";

export interface SlashCommandMenuProps {
  editor: Editor;
  registry?: BlockCommandRegistry;
}

export const SlashCommandMenu: React.FC<SlashCommandMenuProps> = ({
  editor,
  registry = defaultBlockRegistry,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const selectedIndexRef = React.useRef(0);
  const matchRangeRef = React.useRef<{ from: number; to: number }>({ from: 0, to: 0 });
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [position, setPosition] = React.useState<{ top: number; left: number; above?: boolean }>({
    top: 0,
    left: 0,
  });
  const menuRef = React.useRef<HTMLDivElement>(null);

  const filteredItems = React.useMemo(() => {
    return registry.search(query, editor);
  }, [registry, query, editor]);

  // Keep selected index within bounds
  React.useEffect(() => {
    selectedIndexRef.current = 0;
    setSelectedIndex(0);
  }, [query, isOpen]);

  const updateMenuState = React.useCallback(() => {
    if (!editor || editor.isDestroyed || !editor.view) {
      setIsOpen(false);
      return;
    }

    const { selection } = editor.state;
    const { $from, empty } = selection;

    if (!empty || !editor.isEditable) {
      setIsOpen(false);
      return;
    }

    // Only trigger in paragraph or heading, NOT code block
    if ($from.parent.type.name === "codeBlock") {
      setIsOpen(false);
      return;
    }

    const textBefore = $from.parent.textBetween(0, $from.parentOffset, undefined, "\ufffc");
    const match = textBefore.match(/^\/([a-zA-Z0-9_-]*)$/);

    if (match) {
      const searchStr = match[1];
      setQuery(searchStr);
      matchRangeRef.current = {
        from: $from.start(),
        to: $from.pos,
      };

      try {
        const coords = editor.view.coordsAtPos($from.pos);
        const menuHeight = 280;
        const menuWidth = 260;

        const isAbove = coords.bottom + menuHeight > window.innerHeight;
        const top = isAbove ? Math.max(16, coords.top - 8) : coords.bottom + 8;
        const left = Math.min(Math.max(16, coords.left), window.innerWidth - menuWidth - 16);

        setPosition({ top, left, above: isAbove });
        setIsOpen(true);
      } catch {
        setIsOpen(false);
      }
    } else {
      setIsOpen(false);
    }
  }, [editor]);

  React.useEffect(() => {
    if (!editor) return;

    editor.on("selectionUpdate", updateMenuState);
    editor.on("transaction", updateMenuState);
    editor.on("blur", updateMenuState);

    return () => {
      editor.off("selectionUpdate", updateMenuState);
      editor.off("transaction", updateMenuState);
      editor.off("blur", updateMenuState);
    };
  }, [editor, updateMenuState]);

  const executeItem = React.useCallback(
    (item: BlockCommandItem) => {
      if (!editor) return;

      const { from, to } = matchRangeRef.current;
      if (to >= from && from >= 0) {
        editor.chain().focus().deleteRange({ from, to }).run();
      }

      item.execute(editor);
      setIsOpen(false);
      requestAnimationFrame(() => {
        editor.view?.focus?.();
      });
    },
    [editor]
  );

  // Keyboard navigation listener
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        e.stopPropagation();
        const next = filteredItems.length ? (selectedIndexRef.current + 1) % filteredItems.length : 0;
        selectedIndexRef.current = next;
        setSelectedIndex(next);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();
        const next = filteredItems.length
          ? (selectedIndexRef.current - 1 + filteredItems.length) % filteredItems.length
          : 0;
        selectedIndexRef.current = next;
        setSelectedIndex(next);
      } else if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        const currentIdx = selectedIndexRef.current;
        if (filteredItems[currentIdx]) {
          executeItem(filteredItems[currentIdx]);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(false);
        requestAnimationFrame(() => {
          editor.view?.focus?.();
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen, filteredItems, executeItem, editor]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      role="dialog"
      aria-label="Slash commands"
      data-zettly-slash-menu=""
      style={{
        position: "fixed",
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: position.above ? "translateY(-100%)" : "none",
      }}
      className={cn(
        "z-50 w-64 rounded-xl border border-slate-200 dark:border-slate-800",
        "bg-white/95 text-slate-900 shadow-2xl backdrop-blur-md dark:bg-slate-900/95 dark:text-slate-100",
        "animate-in fade-in zoom-in-95 duration-100"
      )}
    >
      <div className="border-b border-slate-100 dark:border-slate-800 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        Insert Block {query && `· "${query}"`}
      </div>

      <BlockMenuList
        items={filteredItems}
        selectedIndex={selectedIndex}
        onSelect={executeItem}
      />
    </div>
  );
};
