import * as React from "react";

import { ChevronDown } from "lucide-react";

import { cn } from "../../lib/utils";
import {
  type ToolbarRenderProps,
  type CommandDefinition,
  type CommandContext,
} from "../../types/editor";
import { Button } from "../ui/button";
import { emitDebugEvent } from "./debug-utils";

const HeadingSelect: React.FC<{
  command: CommandDefinition;
  context: CommandContext;
  disabled: boolean;
}> = ({ command, context, disabled }) => {
  if (command.type !== "select") {
    return null;
  }

  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = React.useState<React.CSSProperties | undefined>(undefined);

  const value = command.getValue?.(context) ?? "paragraph";
  const labelMap = React.useMemo(
    () => new Map(command.options.map((option) => [option.value, option.label] as const)),
    [command.options]
  );
  const currentLabel = labelMap.get(value) ?? command.label;
  const shortLabel = React.useMemo(() => currentLabel?.split(" ")[0] ?? "--", [currentLabel]);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    const positionMenu = () => {
      const trigger = triggerRef.current;
      if (!trigger) {
        return;
      }
      const rect = trigger.getBoundingClientRect();
      setMenuStyle({
        position: "fixed",
        left: Math.round(rect.left),
        top: Math.round(rect.bottom + 6),
        minWidth: Math.round(rect.width),
        zIndex: 10000,
      });
    };

    positionMenu();

    const handleClick = (event: MouseEvent) => {
      if (
        menuRef.current?.contains(event.target as Node) ||
        triggerRef.current?.contains(event.target as Node)
      ) {
        return;
      }
      setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", positionMenu);
    window.addEventListener("scroll", positionMenu, true);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", positionMenu);
      window.removeEventListener("scroll", positionMenu, true);
    };
  }, [open]);

  const handleSelect = React.useCallback(
    (nextValue: string) => {
      if (disabled) {
        return;
      }
      command.run(context, nextValue);
      setOpen(false);
    },
    [command, context, disabled]
  );

  return (
    <div className="relative">
      <Button
        ref={triggerRef}
        type="button"
        variant="toolbar"
        className="min-w-[72px] justify-between gap-2 rounded-full px-3"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={command.label}
        disabled={disabled}
        onClick={() => {
          if (disabled) {
            return;
          }
          setOpen((prev) => !prev);
        }}
      >
        <span className="font-semibold text-primary">{shortLabel}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
      </Button>
      {open ? (
        <div
          ref={menuRef}
          role="listbox"
          aria-label={command.label}
          className="z-50 rounded-xl p-2 text-sm shadow-lg"
          data-zettly-editor-menu=""
          style={menuStyle}
        >
          {command.options.map((option) => (
            <button
              key={option.value}
              type="button"
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left font-medium transition"
              role="option"
              aria-selected={option.value === value}
              data-selected={option.value === value}
              onClick={() => handleSelect(option.value)}
            >
              <span>{option.label}</span>
              <span className="text-xs">{option.value === value ? "Active" : ""}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

const renderCommand = (
  command: CommandDefinition,
  context: CommandContext,
  active: boolean,
  disabled: boolean
) => {
  if (command.type === "select") {
    return <HeadingSelect key={command.id} command={command} context={context} disabled={disabled} />;
  }

  return (
    <Button
      key={command.id}
      type="button"
      variant="toolbar"
      size="icon"
      aria-pressed={command.type === "toggle" ? active : undefined}
      disabled={disabled}
      onClick={() => {
        if (disabled) {
          return;
        }
        command.run(context);
      }}
      data-state={active ? "on" : "off"}
      title={command.description ?? command.label}
      className="rounded-full"
    >
      {command.icon ?? <span className="text-xs font-medium">{command.label}</span>}
    </Button>
  );
};

interface EditorToolbarProps extends ToolbarRenderProps {
  className?: string;
}

export const DefaultToolbar: React.FC<EditorToolbarProps> = ({
  editor,
  commands,
  permissions,
  messages,
  className,
  debug,
  onDebugEvent,
  onToggleDebug,
}) => {
  const [, forceUpdate] = React.useReducer((state) => state + 1, 0);
  const normalizedPermissions = React.useMemo(
    () => ({ allowLinks: true, ...permissions }),
    [permissions]
  );

  const context = React.useMemo<CommandContext>(
    () => ({ editor, permissions: normalizedPermissions }),
    [editor, normalizedPermissions]
  );

  const emit = React.useCallback(
    (activeCommands: string[]) => {
      emitDebugEvent(debug, onDebugEvent, {
        type: "toolbarUpdate",
        selection: editor.state.selection.toJSON(),
        activeCommands,
      });
    },
    [debug, editor, onDebugEvent]
  );

  React.useEffect(() => {
    const handleUpdate = () => {
      const activeCommands = commands
        .filter((command) => command.isActive?.(context) === true)
        .map((command) => command.id);

      emit(activeCommands);
      forceUpdate();
    };

    editor.on("selectionUpdate", handleUpdate);
    editor.on("transaction", handleUpdate);

    return () => {
      editor.off("selectionUpdate", handleUpdate);
      editor.off("transaction", handleUpdate);
    };
  }, [commands, context, emit, editor, forceUpdate]);

  const groupedCommands = React.useMemo(() => {
    const undoRedo: CommandDefinition[] = [];
    const rest: CommandDefinition[] = [];

    commands.forEach((command) => {
      if (command.id === "undo" || command.id === "redo") {
        undoRedo.push(command);
      } else {
        rest.push(command);
      }
    });

    return { undoRedo, rest };
  }, [commands]);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-full border border-border/40 bg-background/80 px-3 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
      aria-label={messages.info}
    >
      <div className="flex items-center gap-1">
        {groupedCommands.undoRedo.map((command) => {
          const active = command.isActive?.(context) === true;
          const enabled = command.isEnabled?.(context) ?? true;
          const disabled = normalizedPermissions.readOnly === true || !enabled;
          return renderCommand(command, context, active, disabled);
        })}
      </div>
      <div className="h-6 w-px bg-border/70" aria-hidden="true" />
      <div className="flex flex-wrap items-center gap-1">
        {groupedCommands.rest.map((command) => {
          const active = command.isActive?.(context) === true;
          const enabled = command.isEnabled?.(context) ?? true;
          const disabled = normalizedPermissions.readOnly === true || !enabled;
          return renderCommand(command, context, active, disabled);
        })}
      </div>
      {onToggleDebug ? (
        <>
          <div className="h-6 w-px bg-border/70" aria-hidden="true" />
          <Button
            type="button"
            variant="toolbar"
            size="icon"
            aria-pressed={debug}
            onClick={() => onToggleDebug(!debug)}
            title={debug ? "Disable debug" : "Enable debug"}
            data-state={debug ? "on" : "off"}
          >
            <span className="text-xs font-medium">🐞</span>
          </Button>
        </>
      ) : null}
    </div>
  );
};
