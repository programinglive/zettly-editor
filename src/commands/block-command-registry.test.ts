import { describe, expect, test, vi } from "vitest";
import type { Editor } from "@tiptap/core";
import { BlockCommandRegistry } from "./block-command-registry";
import type { BlockCommandItem } from "./types";

describe("BlockCommandRegistry", () => {
  test("initializes with default commands", () => {
    const registry = new BlockCommandRegistry();
    const commands = registry.getAll();
    expect(commands.length).toBeGreaterThanOrEqual(9);

    const ids = commands.map((c) => c.id);
    expect(ids).toContain("paragraph");
    expect(ids).toContain("heading-1");
    expect(ids).toContain("heading-2");
    expect(ids).toContain("heading-3");
    expect(ids).toContain("bullet-list");
    expect(ids).toContain("ordered-list");
    expect(ids).toContain("blockquote");
    expect(ids).toContain("code-block");
    expect(ids).toContain("horizontal-rule");
  });

  test("throws error when registering duplicate command without overwrite", () => {
    const registry = new BlockCommandRegistry();
    const duplicate: BlockCommandItem = {
      id: "paragraph",
      title: "Custom Paragraph",
      description: "Custom",
      searchTerms: ["custom"],
      iconName: "Type",
      category: "basic",
      execute: vi.fn(),
    };

    expect(() => registry.register(duplicate)).toThrow(
      'Command with id "paragraph" is already registered.'
    );

    // With overwrite: true, it replaces cleanly
    expect(() => registry.register(duplicate, true)).not.toThrow();
    expect(registry.get("paragraph")?.title).toBe("Custom Paragraph");
  });

  test("unregisters command cleanly", () => {
    const registry = new BlockCommandRegistry();
    expect(registry.get("heading-1")).toBeTruthy();

    const removed = registry.unregister("heading-1");
    expect(removed).toBe(true);
    expect(registry.get("heading-1")).toBeUndefined();
  });

  test("filters commands by category", () => {
    const registry = new BlockCommandRegistry();
    const basic = registry.getByCategory("basic");
    const lists = registry.getByCategory("lists");
    const advanced = registry.getByCategory("advanced");

    expect(basic.map((c) => c.id)).toEqual(["paragraph", "heading-1", "heading-2", "heading-3"]);
    expect(lists.map((c) => c.id)).toEqual(["bullet-list", "ordered-list"]);
    expect(advanced.map((c) => c.id)).toEqual(["blockquote", "code-block", "horizontal-rule"]);
  });

  test("searches commands by query matching title, description, or searchTerms", () => {
    const registry = new BlockCommandRegistry();

    // Query 'h1' should match Heading 1 via searchTerms
    const h1Results = registry.search("h1");
    expect(h1Results.map((c) => c.id)).toContain("heading-1");

    // Query 'code' should match Code Block
    const codeResults = registry.search("code");
    expect(codeResults.map((c) => c.id)).toContain("code-block");

    // Query 'divider' should match Horizontal Rule
    const dividerResults = registry.search("divider");
    expect(dividerResults.map((c) => c.id)).toContain("horizontal-rule");

    // Empty query returns all available commands
    expect(registry.search("").length).toBe(registry.getAll().length);
  });

  test("executes command callback with editor context", () => {
    const registry = new BlockCommandRegistry();
    const mockEditor = {
      chain: vi.fn().mockReturnThis(),
      focus: vi.fn().mockReturnThis(),
      toggleHeading: vi.fn().mockReturnThis(),
      run: vi.fn(),
    } as unknown as Editor;

    const executed = registry.execute("heading-2", mockEditor);
    expect(executed).toBe(true);
    expect(mockEditor.chain().toggleHeading).toHaveBeenCalledWith({ level: 2 });
  });

  test("honors isEnabled predicate during search and execute", () => {
    const registry = new BlockCommandRegistry();
    const disabledCmd: BlockCommandItem = {
      id: "admin-only",
      title: "Admin Block",
      description: "Restricted",
      searchTerms: ["admin"],
      iconName: "Lock",
      category: "advanced",
      isEnabled: () => false,
      execute: vi.fn(),
    };
    registry.register(disabledCmd);

    const mockEditor = {} as Editor;
    const searchResults = registry.search("admin", mockEditor);
    expect(searchResults.find((c) => c.id === "admin-only")).toBeUndefined();

    const executed = registry.execute("admin-only", mockEditor);
    expect(executed).toBe(false);
    expect(disabledCmd.execute).not.toHaveBeenCalled();
  });
});
