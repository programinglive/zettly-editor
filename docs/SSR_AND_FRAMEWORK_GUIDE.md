# Cross-Framework SSR & Headless Usage Guide

`@programinglive/zettly-editor` separates its **React TipTap client editor** (`.`) from its **zero-DOM headless engine** (`@programinglive/zettly-editor/core`), making it safe for SSR, React Server Components, and Edge runtimes.

## 1. Next.js 15 App Router

Use `@programinglive/zettly-editor/core` directly in Server Components, Route Handlers, and Server Actions, and isolate `ZettlyEditor` inside a `"use client"` boundary:

```tsx
// app/components/article-editor.tsx
"use client";

import { useState } from "react";
import { ZettlyEditor } from "@programinglive/zettly-editor";
import "@programinglive/zettly-editor/styles";

export function ArticleEditor({ initialHtml }: { initialHtml: string }) {
  const [value, setValue] = useState(initialHtml);
  return <ZettlyEditor value={value} onChange={setValue} />;
}
```

```ts
// app/actions/save-article.ts
"use server";

import { htmlToDocument, validateDocument, documentToHtml } from "@programinglive/zettly-editor/core";

export async function saveArticle(rawHtml: string) {
  const doc = htmlToDocument(rawHtml);
  const check = validateDocument(doc);
  if (!check.valid) {
    throw new Error("Invalid document payload");
  }
  return documentToHtml(doc);
}
```

## 2. React Router v7 / Remix

- Render `<ZettlyEditor />` inside client-mounted routes (or guard with `ClientOnly` / `useEffect` hydration if your SSR environment stubs `window`).
- Run `validateDocument`, `sanitizeDocument`, and `documentToMarkdown` inside `action` / `loader` functions via `@programinglive/zettly-editor/core`.

## 3. Astro

Mount `<ZettlyEditor />` using `client:only="react"` so TipTap/ProseMirror initializes strictly in the browser:

```astro
---
import { ArticleEditor } from "../components/article-editor";
---
<ArticleEditor client:only="react" initialHtml="<p>Hello Astro</p>" />
```

## 4. Cloudflare Workers / Edge Runtimes

`@programinglive/zettly-editor/core` has zero browser DOM dependencies (`window`/`document` are not required), so `validateDocument`, `sanitizeDocument`, `htmlToDocument`, `documentToHtml`, `documentToMarkdown`, `documentToPlainText`, `getDocumentStats`, and `inspectDocument` run directly in Node.js and Edge runtimes.
