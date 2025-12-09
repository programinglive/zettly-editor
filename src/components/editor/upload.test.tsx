import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { ZettlyEditor } from "./zettly-editor";

describe("Image Upload", () => {
    const mockFile = new File(["dummy content"], "test-image.png", { type: "image/png" });


    test("calls onImageUpload when image button is clicked and file selected", async () => {
        const onImageUpload = vi.fn().mockResolvedValue("https://example.com/uploaded.png");

        render(
            <ZettlyEditor
                value="<p>test</p>"
                onChange={() => { }}
                onImageUpload={onImageUpload}
            />
        );

        // Mock document.createElement to return a fake input we can control
        const originalCreateElement = document.createElement.bind(document);
        const inputClickSpy = vi.fn();
        let capturedInput: HTMLInputElement | null = null;

        vi.spyOn(document, 'createElement').mockImplementation((tagName, options) => {
            const el = originalCreateElement(tagName, options);
            if (tagName === 'input') {
                capturedInput = el as HTMLInputElement;
                el.click = inputClickSpy;
            }
            return el;
        });

        // Find the image button by its label "Image" or icon
        // The default commands use "Image" label.
        // We might need to look for the button with aria-label or title "Image"
        const imageButton = screen.getByRole("button", { name: /Image/i });
        fireEvent.click(imageButton);

        expect(inputClickSpy).toHaveBeenCalled();
        expect(capturedInput).toBeTruthy();

        if (capturedInput) {
            // Define files property on the input
            const input = capturedInput as HTMLInputElement;
            Object.defineProperty(input, 'files', {
                value: [mockFile],
            });

            // Trigger change
            fireEvent.change(input);
        }

        await waitFor(() => {
            expect(onImageUpload).toHaveBeenCalledWith(mockFile);
        });

        vi.restoreAllMocks();
    });
});
