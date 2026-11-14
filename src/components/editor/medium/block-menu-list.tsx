import * as React from "react";
import type { BlockCommandItem } from "../../../commands/types";
import { BlockCommandIcon } from "./block-command-icons";
import { cn } from "../../../lib/utils";

export interface BlockMenuListProps {
  items: BlockCommandItem[];
  selectedIndex: number;
  onSelect: (item: BlockCommandItem) => void;
  className?: string;
  maxHeight?: string;
}

export const BlockMenuList: React.FC<BlockMenuListProps> = ({
  items,
  selectedIndex,
  onSelect,
  className,
  maxHeight = "max-h-72",
}) => {
  const listRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll selected item into view
  React.useEffect(() => {
    if (!listRef.current) return;
    const selectedEl = listRef.current.querySelector<HTMLElement>(
      `[data-index="${selectedIndex}"]`
    );
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  if (items.length === 0) {
    return (
      <div className="px-4 py-3 text-center text-xs text-slate-400">
        No matching commands
      </div>
    );
  }

  return (
    <div
      ref={listRef}
      role="listbox"
      aria-label="Commands"
      className={cn(
        "overflow-y-auto overflow-x-hidden p-1.5 focus:outline-none select-none",
        maxHeight,
        className
      )}
    >
      {items.map((item, index) => {
        const isSelected = index === selectedIndex;
        return (
          <button
            key={item.id}
            type="button"
            role="option"
            data-index={index}
            aria-selected={isSelected}
            onClick={() => onSelect(item)}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition-colors",
              isSelected
                ? "bg-indigo-600 text-white dark:bg-indigo-600"
                : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            )}
          >
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded border",
                isSelected
                  ? "border-indigo-400/50 bg-indigo-500/30 text-white"
                  : "border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
              )}
            >
              <BlockCommandIcon name={item.iconName} className="h-4 w-4" />
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-center justify-between gap-1">
                <span className="font-medium truncate">{item.title}</span>
                {item.shortcut && (
                  <span
                    className={cn(
                      "font-mono text-[10px] px-1 py-0.2 rounded shrink-0",
                      isSelected
                        ? "text-indigo-200 bg-indigo-700/60"
                        : "text-slate-400 bg-slate-100 dark:bg-slate-800"
                    )}
                  >
                    {item.shortcut}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "truncate text-[11px]",
                  isSelected ? "text-indigo-100" : "text-slate-400 dark:text-slate-400"
                )}
              >
                {item.description}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
