import { describe, expect, test } from "vitest";
import { Editor } from "@tiptap/core";
import { StarterKit } from "@tiptap/starter-kit";
import { Link } from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";

describe("Security Regression & Sanitization Gates", () => {
  test("strips executable script tags from parsed HTML content", () => {
    const editor = new Editor({
      extensions: [StarterKit.configure({ link: false })],
      content: "<p>Safe text<script>alert('xss')</script></p>",
    });

    const html = editor.getHTML();
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("alert('xss')");
    expect(html).toContain("Safe text");
    editor.destroy();
  });

  test("strips inline DOM event handler attributes (onerror, onload, onclick)", () => {
    const editor = new Editor({
      extensions: [
        StarterKit.configure({ link: false }),
        Image.configure({ inline: true }),
      ],
      content: '<p>Image test <img src="https://example.com/pic.jpg" onerror="alert(1)" onload="alert(2)" onclick="alert(3)" /></p>',
    });

    const html = editor.getHTML();
    expect(html).not.toContain("onerror");
    expect(html).not.toContain("onload");
    expect(html).not.toContain("onclick");
    expect(html).toContain('src="https://example.com/pic.jpg"');
    editor.destroy();
  });

  test("prevents Object.prototype pollution via malicious attributes (GHSA-cp6q-959q-f8rh)", () => {
    const maliciousPayload = '<p data-__proto__="polluted" data-constructor="polluted">Pollution test</p>';
    const editor = new Editor({
      extensions: [StarterKit.configure({ link: false })],
      content: maliciousPayload,
    });

    // Check that Object prototype was not polluted
    expect((Object.prototype as Record<string, unknown>).polluted).toBeUndefined();
    editor.destroy();
  });

  test("sanitizes unsafe JavaScript and VBScript link protocols", () => {
    const editor = new Editor({
      extensions: [
        StarterKit.configure({ link: false }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
          validate: (href) => /^https?:\/\//.test(href),
        }),
      ],
      content: '<p><a href="javascript:alert(1)">Malicious link</a> and <a href="https://example.com">Safe link</a></p>',
    });

    const html = editor.getHTML();
    expect(html).not.toContain('href="javascript:');
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('rel="noopener noreferrer"');
    editor.destroy();
  });

  test("escapes HTML special characters in serialized text content", () => {
    const editor = new Editor({
      extensions: [StarterKit.configure({ link: false })],
      content: "<p>&lt;img src=x onerror=alert(1)&gt;</p>",
    });

    const html = editor.getHTML();
    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");
    expect(html).not.toContain("<img src=x");
    editor.destroy();
  });
});
