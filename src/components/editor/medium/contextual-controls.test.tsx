import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import type { Editor } from "@tiptap/core";
import { SlashCommandMenu } from "./slash-command-menu";
import { FloatingBlockInserter } from "./floating-block-inserter";
import { BlockCommandRegistry } from "../../../commands/block-command-registry";

describe("SlashCommandMenu Component", () => {
  const createMockEditor = (options: {
    textBefore?: string;
    nodeType?: string;
    empty?: boolean;
    isEditable?: boolean;
    startPos?: number;
    currentPos?: number;
  } = {}) => {
    const {
      textBefore = "",
      nodeType = "paragraph",
      empty = true,
      isEditable = true,
      startPos = 0,
      currentPos = textBefore.length,
    } = options;

    const listeners: Record<string, Array<(...args: unknown[]) => void>> = {};

    const chain = {
      focus: vi.fn().mockReturnThis(),
      deleteRange: vi.fn().mockReturnThis(),
      toggleHeading: vi.fn().mockReturnThis(),
      toggleCodeBlock: vi.fn().mockReturnThis(),
      run: vi.fn(),
    };

    const editor = {
      isDestroyed: false,
      isEditable,
      state: {
        selection: {
          empty,
          $from: {
            pos: currentPos,
            parentOffset: currentPos,
            parent: {
              type: { name: nodeType },
              textBetween: vi.fn(() => textBefore),
              content: { size: textBefore.length },
            },
            start: vi.fn(() => startPos),
          },
        },
      },
      view: {
        focus: vi.fn(),
        coordsAtPos: vi.fn(() => ({
          left: 150,
          top: 200,
          right: 170,
          bottom: 224,
          height: 24,
        })),
      },
      chain: vi.fn(() => chain),
      on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
        listeners[event] = listeners[event] ?? [];
        listeners[event].push(handler);
      }),
      off: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
        listeners[event] = (listeners[event] ?? []).filter((l) => l !== handler);
      }),
      emit: (event: string, ...args: unknown[]) => {
        listeners[event]?.forEach((handler) => handler(...args));
      },
      _chain: chain,
    };

    return editor;
  };

  test("does not render when text does not start with slash", () => {
    const mockEditor = createMockEditor({ textBefore: "Hello world" });
    const { container } = render(
      <SlashCommandMenu editor={mockEditor as unknown as Editor} />
    );

    act(() => {
      mockEditor.emit("selectionUpdate");
    });

    expect(container.querySelector("[data-zettly-slash-menu]")).toBeNull();
  });

  test("does not render inside code blocks even if slash is typed", () => {
    const mockEditor = createMockEditor({ textBefore: "/h1", nodeType: "codeBlock" });
    const { container } = render(
      <SlashCommandMenu editor={mockEditor as unknown as Editor} />
    );

    act(() => {
      mockEditor.emit("selectionUpdate");
    });

    expect(container.querySelector("[data-zettly-slash-menu]")).toBeNull();
  });

  test("opens when paragraph starts with slash and displays filtered commands", () => {
    const mockEditor = createMockEditor({ textBefore: "/h" });
    const { container } = render(
      <SlashCommandMenu editor={mockEditor as unknown as Editor} />
    );

    act(() => {
      mockEditor.emit("selectionUpdate");
    });

    const menu = container.querySelector("[data-zettly-slash-menu]");
    expect(menu).toBeTruthy();

    // Query '/h' should show Heading 1, Heading 2, Heading 3
    expect(screen.getByRole("option", { name: /Heading 1/i })).toBeTruthy();
    expect(screen.getByRole("option", { name: /Heading 2/i })).toBeTruthy();
    expect(screen.getByRole("option", { name: /Heading 3/i })).toBeTruthy();
  });

  test("navigates with keyboard and executes command on Enter", () => {
    const mockEditor = createMockEditor({ textBefore: "/h" });
    render(<SlashCommandMenu editor={mockEditor as unknown as Editor} />);

    act(() => {
      mockEditor.emit("selectionUpdate");
    });

    // Press ArrowDown to navigate to Heading 2
    fireEvent.keyDown(window, { key: "ArrowDown" });

    // Press Enter to apply
    fireEvent.keyDown(window, { key: "Enter" });

    // Deletes range and executes Heading 2
    expect(mockEditor.chain().deleteRange).toHaveBeenCalled();
    expect(mockEditor.chain().toggleHeading).toHaveBeenCalledWith({ level: 2 });
  });

  test("dismisses on Escape key", () => {
    const mockEditor = createMockEditor({ textBefore: "/" });
    const { container } = render(
      <SlashCommandMenu editor={mockEditor as unknown as Editor} />
    );

    act(() => {
      mockEditor.emit("selectionUpdate");
    });

    expect(container.querySelector("[data-zettly-slash-menu]")).toBeTruthy();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(container.querySelector("[data-zettly-slash-menu]")).toBeNull();
  });
});

describe("FloatingBlockInserter Component", () => {
  const createMockEditor = (isEmptyLine = true) => {
    const listeners: Record<string, Array<(...args: unknown[]) => void>> = {};

    const chain = {
      focus: vi.fn().mockReturnThis(),
      toggleHeading: vi.fn().mockReturnThis(),
      toggleBulletList: vi.fn().mockReturnThis(),
      run: vi.fn(),
    };

    const editor = {
      isDestroyed: false,
      isEditable: true,
      state: {
        selection: {
          empty: true,
          $from: {
            pos: 10,
            parent: {
              type: { name: "paragraph" },
              content: { size: isEmptyLine ? 0 : 5 },
            },
          },
        },
      },
      view: {
        coordsAtPos: vi.fn(() => ({
          left: 100,
          top: 150,
          bottom: 174,
          height: 24,
        })),
      },
      chain: vi.fn(() => chain),
      on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
        listeners[event] = listeners[event] ?? [];
        listeners[event].push(handler);
      }),
      off: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
        listeners[event] = (listeners[event] ?? []).filter((l) => l !== handler);
      }),
      emit: (event: string, ...args: unknown[]) => {
        listeners[event]?.forEach((handler) => handler(...args));
      },
      _chain: chain,
    };

    return editor;
  };

  test("does not render on non-empty paragraph", () => {
    const mockEditor = createMockEditor(false);
    const { container } = render(
      <FloatingBlockInserter editor={mockEditor as unknown as Editor} />
    );

    act(() => {
      mockEditor.emit("selectionUpdate");
    });

    expect(container.querySelector("[data-zettly-block-inserter]")).toBeNull();
  });

  test("renders plus button on empty paragraph line and toggles menu on click", () => {
    const mockEditor = createMockEditor(true);
    const { container } = render(
      <FloatingBlockInserter editor={mockEditor as unknown as Editor} />
    );

    act(() => {
      mockEditor.emit("selectionUpdate");
    });

    const addBtn = screen.getByRole("button", { name: "Add block" });
    expect(addBtn).toBeTruthy();

    // Menu initially closed
    expect(container.querySelector("[data-zettly-block-menu]")).toBeNull();

    // Click to open menu
    fireEvent.click(addBtn);
    expect(container.querySelector("[data-zettly-block-menu]")).toBeTruthy();

    // Find and click Bullet List option
    const bulletOption = screen.getByRole("option", { name: /Bullet List/i });
    fireEvent.click(bulletOption);

    // Executes bullet list and closes menu
    expect(mockEditor.chain().toggleBulletList).toHaveBeenCalled();
    expect(container.querySelector("[data-zettly-block-menu]")).toBeNull();
  });

  test("uses custom BlockCommandRegistry when provided", () => {
    const customRegistry = new BlockCommandRegistry([]);
    const customExecute = vi.fn();
    customRegistry.register({
      id: "custom-callout",
      title: "Custom Callout",
      description: "Callout box",
      searchTerms: ["callout"],
      iconName: "Info",
      category: "advanced",
      execute: customExecute,
    });

    const mockEditor = createMockEditor(true);
    const { container } = render(
      <FloatingBlockInserter
        editor={mockEditor as unknown as Editor}
        registry={customRegistry}
      />
    );

    act(() => {
      mockEditor.emit("selectionUpdate");
    });

    fireEvent.click(screen.getByRole("button", { name: "Add block" }));
    expect(container.querySelector("[data-zettly-block-menu]")).toBeTruthy();
    expect(screen.getByRole("option", { name: /Custom Callout/i })).toBeTruthy();

    fireEvent.click(screen.getByRole("option", { name: /Custom Callout/i }));
    expect(customExecute).toHaveBeenCalledWith(mockEditor);
  });
});
