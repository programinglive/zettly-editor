import { describe, expect, test } from "vitest";
import pkg from "../package.json";
import versionrc from "../.versionrc.json";

import { ZettlyEditor, MediumEditor, BubbleToolbar } from "./index";

describe("@programinglive/zettly-editor", () => {
  test("exports ZettlyEditor and modern contextual components", () => {
    expect(ZettlyEditor).toBeTypeOf("function");
    expect(MediumEditor).toBeTypeOf("function");
    expect(BubbleToolbar).toBeTypeOf("function");
  });

  test("maintains valid package identity and release lifecycle hooks", () => {
    expect(pkg.name).toBe("@programinglive/zettly-editor");
    expect(versionrc.commitAll).toBe(true);
    expect(versionrc.scripts?.postchangelog).toBe(
      "node scripts/update-release-notes.cjs && git add docs/release-notes/RELEASE_NOTES.md"
    );
  });
});
