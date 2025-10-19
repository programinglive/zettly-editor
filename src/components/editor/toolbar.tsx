import * as React from "react";

import { cn } from "../../lib/utils";
import { type ToolbarRenderProps } from "../../types/editor";
import { Button } from "../ui/button";
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
}) => {
  const [, forceUpdate] = React.useReducer((state) => state + 1, 0);
  const normalizedPermissions = React.useMemo(
    () => ({ allowLinks: true, ...permissions }),
    [permissions]
  );

  const context = React.useMemo(
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
      })}
    </div>
  );
};
