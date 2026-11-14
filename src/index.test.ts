import { describe, expect, test } from "vitest";
import pkg from "../package.json";
import versionrc from "../.versionrc.json";

import { ZettlyEditor } from "./index";

describe("@programinglive/zettly-editor", () => {
  test("exports ZettlyEditor component", () => {
    expect(ZettlyEditor).toBeTypeOf("function");
  });

  test("maintains valid package identity and release lifecycle hooks", () => {
    expect(pkg.name).toBe("@programinglive/zettly-editor");
    expect(versionrc.commitAll).toBe(true);
    expect(versionrc.scripts?.postchangelog).toBe(
      "node scripts/update-release-notes.cjs && git add docs/release-notes/RELEASE_NOTES.md"
    );
  });
});
