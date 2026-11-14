import { describe, expect, test, vi } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { ZettlyEditor } from "./zettly-editor";

describe("Image Upload", () => {
  const mockFile = new File(["dummy content"], "test-image.png", { type: "image/png" });

  test("calls onImageUpload when image is dropped or pasted onto the editor", async () => {
    const onImageUpload = vi.fn().mockResolvedValue("https://example.com/uploaded.png");

    const { container } = render(
      <ZettlyEditor
        value="<p>test</p>"
        onChange={() => {}}
        onImageUpload={onImageUpload}
      />
    );

    const surface = container.querySelector(".ProseMirror");
    expect(surface).toBeTruthy();

    if (surface) {
      // Simulate clipboard paste with an image file
      const pasteEvent = new Event("paste", { bubbles: true, cancelable: true });
      Object.defineProperty(pasteEvent, "clipboardData", {
        value: {
          files: [mockFile],
          items: [
            {
              type: "image/png",
              getAsFile: () => mockFile,
            },
          ],
          types: ["Files"],
          getData: () => "",
        },
      });

      fireEvent(surface, pasteEvent);

      await waitFor(() => {
        expect(onImageUpload).toHaveBeenCalledWith(mockFile);
      });
    }
  });
});
