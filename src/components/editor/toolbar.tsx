import * as React from "react";

import { cn } from "../../lib/utils";
import {
  type ToolbarRenderProps,
  type CommandDefinition,
  type CommandContext,
} from "../../types/editor";
import { Button } from "../ui/button";

const renderCommand = (
  command: CommandDefinition,
  context: CommandContext,
  active: boolean,
  disabled: boolean
) => {
  if (command.type === "select") {
    const value = command.getValue?.(context) ?? "";
    return (
      <select
        key={command.id}
        className="h-9 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={value}
        aria-label={command.label}
        disabled={disabled}
        onChange={(event) => {
          if (disabled) {
            return;
          }
          command.run(context, event.target.value);
        }}
      >
        {command.placeholder ? (
          <option value="" disabled hidden>
            {command.placeholder}
          </option>
        ) : null}
        {command.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
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
    >
      {command.icon ?? <span className="text-xs font-medium">{command.label}</span>}
    </Button>
  );
};
import { emitDebugEvent } from "./debug-utils";

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

  return (
    <div
      className={cn(
        "relative flex flex-wrap items-center gap-1 rounded-full bg-background/40 px-1 py-1 backdrop-blur supports-[backdrop-filter]:bg-background/30",
        className
      )}
      aria-label={messages.info}
    >
      {commands.map((command) => {
        const active = command.isActive?.(context) === true;
        const enabled = command.isEnabled?.(context) ?? true;
        const disabled = normalizedPermissions.readOnly === true || !enabled;
        return renderCommand(command, context, active, disabled);
      })}
      {onToggleDebug ? (
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
      ) : null}
    </div>
  );
};
