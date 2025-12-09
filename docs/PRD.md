# Product Requirements Document (PRD): Zettly Editor

## 1. Executive Summary

**Product Name:** `@programinglive/zettly-editor`

**Vision:** accurate, beautiful, and developer-friendly rich-text editor for Zettly's ecosystem of note-taking and todo applications. It aims to provide a "drop-in" WYSIWYG experience that feels premium, supports code snippets with syntax highlighting, and integrates seamlessly into React/Next.js/Laravel stacks.

## 2. Target Audience

- **Primary:** Developers building Zettly applications (Internal & Open Source).
- **Secondary:** React developers looking for a polished, Shadcn-styled Tiptap editor wrapper.

## 3. Core Requirements

### 3.1 Editor Core
- **Rich Text Editing:** Powered by [TipTap](https://tiptap.dev/), offering a headless, extensible foundation.
- **Styling:** Built with [Tailwind CSS](https://tailwindcss.com/) and [Shadcn UI](https://ui.shadcn.com/) for consistent, modern aesthetics.
- **Dark Mode Support:** Native support for light and dark themes using CSS variables.
- **Controlled Input:** Must support React's controlled component pattern (`value` + `onChange`).

### 3.2 Toolbar & Formatting
The editor must include a fixed or sticky toolbar with the following capabilities:
- **Typography:** Headings (H1-H6), Paragraph.
- **Emphasis:** Bold, Italic, Strikethrough.
- **Lists:** Bullet List, Ordered List.
- **Special Blocks:** Blockquote, Code Block (with syntax highlighting).
- **Links:** Insert, edit, and remove links with permission checks.
- **Highlighting:** Text highlighting support.
- **Undo/Redo:** History management.

### 3.3 improved Developer Experience (DX)
- **Zero-Config Styles:** Optional single-file import (`with-styles.js`) that injects necessary CSS.
- **Debug Mode:**
  - Built-in debug toggle to inspect Tiptap nodes/lifecycle.
  - Structure `DebugEvent` emission for remote logging (e.g., to Sentry or internal logs).
  - Visual indicator in the footer for version and debug status.
- **Type Safety:** Written in TypeScript with full type definitions exported.

### 3.4 Integration
- **Framework Agnostic:** Works in any React 18+ environment (Vite, Next.js, Remix, Laravel+Inertia).
- **SSR Compatible:** Safe for server-side rendering (avoids window reference errors).
- **Bundling:** Efficient distribution via `tsup`, exporting ESM and CJS formats.

## 4. Technical Architecture

### 4.1 Stack
- **Framework:** React 18
- **Editor Engine:** Tiptap v2 (prosemirror under the hood)
- **UI System:** Radix UI primitives + Tailwind CSS
- **Highlighter:** `lowlight` + `highlight.js`
- **Build Tool:** `tsup` (compiled to `dist/`)

### 4.2 Module Structure
- **Core Package:** `@programinglive/zettly-editor`
- **Styles:** `@programinglive/zettly-editor/styles` (or bundled via `with-styles`)
- **External Dependencies:**
  - `react`, `react-dom` (Peer Dependencies)
  - `@tiptap/*` (Bundled, except where modularity is preferred)

## 5. Release Strategy & Versioning

- **Versioning:** Semantic Versioning (SemVer).
- **Automation:** Uses `@programinglive/commiter` for standard-version releases.
- **Changelog:** Automatically generated in `docs/release-notes/RELEASE_NOTES.md`.
- **Distribution:** Published to NPM and GitHub Packages.

## 6. Future Roadmap (Potential)
- [x] Image Upload / Drag-and-Drop support.
- [ ] Collaborative editing integration (Hocuspocus/Y.js).
- [ ] Table support with advanced formatting.
- [ ] AI-assisted writing features.
