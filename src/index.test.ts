import { describe, expect, test } from "vitest";

import { ZettlyEditor } from "./index";

describe("@programinglive/zettly-editor", () => {
  test("exports ZettlyEditor component", () => {
    expect(ZettlyEditor).toBeTypeOf("function");
  });
});
