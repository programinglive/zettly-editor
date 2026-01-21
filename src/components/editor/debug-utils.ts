import type { DebugEvent } from "../../types/editor";

type OptionalTimestamp<T extends { timestamp: number }> = Omit<T, "timestamp"> & { timestamp?: number };

export type DebugEventInput =
  | OptionalTimestamp<Extract<DebugEvent, { type: "create" }>>
  | OptionalTimestamp<Extract<DebugEvent, { type: "update" }>>
  | OptionalTimestamp<Extract<DebugEvent, { type: "transaction" }>>
  | OptionalTimestamp<Extract<DebugEvent, { type: "selectionUpdate" }>>
  | OptionalTimestamp<Extract<DebugEvent, { type: "toolbarUpdate" }>>
  | OptionalTimestamp<Extract<DebugEvent, { type: "error" }>>;

export const emitDebugEvent = (
  debug: boolean,
  handler: ((event: DebugEvent) => void) | undefined,
  event: DebugEventInput
) => {
  if (!debug && !handler) {
    return;
  }

  const payload: DebugEvent = {
    ...event,
    timestamp: event.timestamp ?? Date.now(),
  } as DebugEvent;

  handler?.(payload);

  if (debug) {
    console.debug(`[ZettlyEditor][${payload.type}]`, payload);
  }
};
