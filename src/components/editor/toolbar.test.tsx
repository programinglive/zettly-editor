import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Editor } from "@tiptap/core";

import { DefaultToolbar } from "./toolbar";
import type { CommandDefinition, EditorMessages, EditorPermissions } from "../../types/editor";

const createMockEditor = (): Editor => {
  const listeners: Record<string, Array<(...args: unknown[]) => void>> = {};

  const editorStub = {
    state: {
      selection: {
        toJSON: vi.fn(() => ({})),
      },
    },
    on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
      listeners[event] = listeners[event] ?? [];
      listeners[event]!.push(handler);
    }),
    off: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
      listeners[event] = (listeners[event] ?? []).filter((listener) => listener !== handler);
    }),
  };

  return editorStub as unknown as Editor;
};

const baseMessages: EditorMessages = {
  placeholder: "",
  linkPrompt: "",
  success: "",
  warning: "",
  error: "",
  info: "Formatting toolbar",
};

const permissions: EditorPermissions = {
  allowLinks: true,
};

describe("DefaultToolbar responsive layout", () => {
  const buildCommands = (): CommandDefinition[] => [
    {
      id: "undo",
      label: "Undo",
      type: "button",
      run: vi.fn(),
    },
    {
      id: "redo",
      label: "Redo",
      type: "button",
      run: vi.fn(),
    },
    {
      id: "heading",
      label: "Heading",
      type: "select",
      options: [
        { value: "paragraph", label: "Paragraph" },
        { value: "h1", label: "Heading 1" },
      ],
      getValue: () => "paragraph",
      run: vi.fn(),
    },
    {
      id: "bold",
      label: "Bold",
      type: "toggle",
      run: vi.fn(),
      isActive: () => false,
    },
  ];

  it("uses scrollable layout classes on small screens", () => {
    const { getByLabelText } = render(
      <DefaultToolbar
        editor={createMockEditor()}
        commands={buildCommands()}
        permissions={permissions}
        messages={baseMessages}
        debug={false}
      />
    );

    const toolbar = getByLabelText(baseMessages.info);

    expect(toolbar.classList.contains("overflow-x-auto")).toBe(true);
    expect(toolbar.className).toContain("sm:overflow-visible");
    expect(toolbar.classList.contains("w-full")).toBe(true);
  });

  it("reduces minimum width for heading selector on mobile", () => {
    const { getAllByRole } = render(
      <DefaultToolbar
        editor={createMockEditor()}
        commands={buildCommands()}
        permissions={permissions}
        messages={baseMessages}
        debug={false}
      />
    );

    const headingButton = getAllByRole("button", { name: /heading/i })[0];

    expect(headingButton.classList.contains("min-w-[60px]")).toBe(true);
    expect(headingButton.className).toContain("sm:min-w-[72px]");
  });
});
