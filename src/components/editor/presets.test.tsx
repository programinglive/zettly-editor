import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import type { Editor } from "@tiptap/core";
import { ZettlyEditor } from "./zettly-editor";
import { BubbleToolbar } from "./medium/bubble-toolbar";

describe("Editor Presets & Medium Writing Experience", () => {
  test("defaults to preset='medium' and renders borderless layout without top toolbar", () => {
    const { container } = render(
      <ZettlyEditor
        value="<p>Welcome to Medium style</p>"
        onChange={() => {}}
      />
    );

    const root = container.querySelector("[data-zettly-editor-root]");
    expect(root).toBeTruthy();
    expect(root?.getAttribute("data-preset")).toBe("medium");

    // Medium preset does NOT render static top toolbar
    const toolbar = container.querySelector("[data-zettly-editor-toolbar]");
    expect(toolbar).toBeNull();
  });

  test("preset='classic' renders boxed layout with top toolbar for backward compatibility", () => {
    const { container } = render(
      <ZettlyEditor
        preset="classic"
        value="<p>Classic with toolbar</p>"
        onChange={() => {}}
      />
    );

    const root = container.querySelector("[data-zettly-editor-root]");
    expect(root).toBeTruthy();
    expect(root?.getAttribute("data-preset")).toBe("classic");

    // Classic preset MUST render top toolbar
    const toolbar = container.querySelector("[data-zettly-editor-toolbar]");
    expect(toolbar).toBeTruthy();
  });

  test("Medium preset supports custom className and editorClassName", () => {
    const { container } = render(
      <ZettlyEditor
        preset="medium"
        value="<p>Custom styled</p>"
        onChange={() => {}}
        className="custom-container"
        editorClassName="custom-editor"
      />
    );

    const root = container.querySelector("[data-zettly-editor-root]");
    expect(root?.classList.contains("custom-container")).toBe(true);

    const surface = container.querySelector("[data-zettly-editor-surface]");
    expect(surface?.classList.contains("custom-editor")).toBe(true);
  });
});

describe("BubbleToolbar Component", () => {
  const createMockEditor = (options: {
    from?: number;
    to?: number;
    empty?: boolean;
    isEditable?: boolean;
    activeMarks?: Record<string, boolean>;
    linkHref?: string;
  } = {}) => {
    const {
      from = 0,
      to = 5,
      empty = false,
      isEditable = true,
      activeMarks = {},
      linkHref = "",
    } = options;

    const listeners: Record<string, Array<(...args: unknown[]) => void>> = {};

    const chain = {
      focus: vi.fn().mockReturnThis(),
      toggleBold: vi.fn().mockReturnThis(),
      toggleItalic: vi.fn().mockReturnThis(),
      toggleStrike: vi.fn().mockReturnThis(),
      toggleHeading: vi.fn().mockReturnThis(),
      toggleBlockquote: vi.fn().mockReturnThis(),
      toggleCode: vi.fn().mockReturnThis(),
      extendMarkRange: vi.fn().mockReturnThis(),
      setLink: vi.fn().mockReturnThis(),
      unsetLink: vi.fn().mockReturnThis(),
      run: vi.fn(),
    };

    const editor = {
      isDestroyed: false,
      isEditable,
      state: {
        selection: {
          from,
          to,
          empty,
        },
      },
      view: {
        coordsAtPos: vi.fn((pos: number) => ({
          left: 100 + pos * 10,
          top: 200,
          right: 120 + pos * 10,
          bottom: 220,
        })),
      },
      isActive: vi.fn((name: string, attrs?: Record<string, unknown>) => {
        if (attrs?.level && name === "heading") {
          return Boolean(activeMarks[`heading-${attrs.level}`]);
        }
        return Boolean(activeMarks[name]);
      }),
      getAttributes: vi.fn((name: string) => {
        if (name === "link") {
          return { href: linkHref };
        }
        return {};
      }),
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

  test("does not render when selection is empty", () => {
    const mockEditor = createMockEditor({ empty: true, from: 0, to: 0 });

    const { container } = render(
      <BubbleToolbar editor={mockEditor as unknown as Editor} />
    );

    expect(container.querySelector("[data-zettly-bubble-toolbar]")).toBeNull();
  });

  test("renders formatting buttons when selection is active", () => {
    const mockEditor = createMockEditor({ empty: false, from: 2, to: 8 });

    render(<BubbleToolbar editor={mockEditor as unknown as Editor} />);

    // Trigger selectionUpdate
    act(() => {
      mockEditor.emit("selectionUpdate");
    });

    const toolbar = screen.getByRole("toolbar", { name: /formatting options/i });
    expect(toolbar).toBeTruthy();

    const boldBtn = screen.getByRole("button", { name: "Bold" });
    const italicBtn = screen.getByRole("button", { name: "Italic" });
    const strikeBtn = screen.getByRole("button", { name: "Strikethrough" });
    const h2Btn = screen.getByRole("button", { name: "Heading 2" });
    const quoteBtn = screen.getByRole("button", { name: "Blockquote" });
    const codeBtn = screen.getByRole("button", { name: "Inline Code" });
    const linkBtn = screen.getByRole("button", { name: "Link" });

    expect(boldBtn).toBeTruthy();
    expect(italicBtn).toBeTruthy();
    expect(strikeBtn).toBeTruthy();
    expect(h2Btn).toBeTruthy();
    expect(quoteBtn).toBeTruthy();
    expect(codeBtn).toBeTruthy();
    expect(linkBtn).toBeTruthy();

    // Test clicking Bold button
    fireEvent.click(boldBtn);
    expect(mockEditor.chain().toggleBold().run).toHaveBeenCalled();

    // Test clicking Italic button
    fireEvent.click(italicBtn);
    expect(mockEditor.chain().toggleItalic().run).toHaveBeenCalled();

    // Test clicking Heading 2 button
    fireEvent.click(h2Btn);
    expect(mockEditor.chain().toggleHeading({ level: 2 }).run).toHaveBeenCalled();
  });

  test("handles inline link editing, auto-prepending https:// and keyboard shortcuts", () => {
    const mockEditor = createMockEditor({ empty: false, from: 0, to: 5 });

    render(<BubbleToolbar editor={mockEditor as unknown as Editor} allowLinks={true} />);

    act(() => {
      mockEditor.emit("selectionUpdate");
    });

    const linkBtn = screen.getByRole("button", { name: "Link" });
    fireEvent.click(linkBtn);

    const input = screen.getByLabelText("Link URL input") as HTMLInputElement;
    expect(input).toBeTruthy();

    // Type a domain without protocol
    fireEvent.change(input, { target: { value: "example.com" } });
    expect(input.value).toBe("example.com");

    // Submit the form
    const applyBtn = screen.getByRole("button", { name: "Apply link" });
    fireEvent.click(applyBtn);

    // Should auto-prepend https://
    expect(mockEditor.chain().setLink).toHaveBeenCalledWith({ href: "https://example.com" });
  });

  test("dismisses link mode on Escape key", () => {
    const mockEditor = createMockEditor({ empty: false, from: 0, to: 5 });

    render(<BubbleToolbar editor={mockEditor as unknown as Editor} allowLinks={true} />);

    act(() => {
      mockEditor.emit("selectionUpdate");
    });

    const linkBtn = screen.getByRole("button", { name: "Link" });
    fireEvent.click(linkBtn);

    expect(screen.getByLabelText("Link URL input")).toBeTruthy();

    // Press Escape
    fireEvent.keyDown(window, { key: "Escape" });

    // Link input should be closed and standard buttons restored
    expect(screen.queryByLabelText("Link URL input")).toBeNull();
    expect(screen.getByRole("button", { name: "Bold" })).toBeTruthy();
  });
});
