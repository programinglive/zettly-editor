import { describe, expect, test } from "vitest";
import pkg from "../package.json";
import versionrc from "../.versionrc.json";

import * as PublicApi from "./index";
import { ZettlyEditor, MediumEditor, BubbleToolbar } from "./index";

describe("@programinglive/zettly-editor", () => {
  test("exports ZettlyEditor and modern contextual components", () => {
    expect(ZettlyEditor).toBeTypeOf("function");
    expect(MediumEditor).toBeTypeOf("function");
    expect(BubbleToolbar).toBeTypeOf("function");
  });

  test("freezes v1.0.0 Modern-Only public API exports and excludes removed Classic symbols", () => {
    const expectedFunctions = [
      "ZettlyEditor",
      "MediumEditor",
      "BubbleToolbar",
      "SlashCommandMenu",
      "FloatingBlockInserter",
      "BlockMenuList",
      "BlockCommandRegistry",
      "validateDocument",
      "sanitizeDocument",
      "htmlToDocument",
      "documentToHtml",
      "documentToMarkdown",
      "documentToPlainText",
      "getDocumentStats",
      "inspectDocument",
    ] as const;

    for (const name of expectedFunctions) {
      expect(PublicApi[name], `Expected export ${name}`).toBeTypeOf("function");
    }

    expect(PublicApi.defaultBlockRegistry).toBeDefined();
    expect(Array.isArray(PublicApi.defaultBlockCommands)).toBe(true);
    expect(PublicApi.ZETTLY_EDITOR_VERSION).toBe(pkg.version);

    const apiRecord = PublicApi as Record<string, unknown>;
    expect(apiRecord.ClassicEditor).toBeUndefined();
    expect(apiRecord.DefaultToolbar).toBeUndefined();
  });

  test("maintains valid package identity and release lifecycle hooks", () => {
    expect(pkg.name).toBe("@programinglive/zettly-editor");
    expect(versionrc.commitAll).toBe(true);
    expect(versionrc.scripts?.postchangelog).toBe(
      "node scripts/update-release-notes.cjs && git add docs/release-notes/RELEASE_NOTES.md"
    );
  });
});
