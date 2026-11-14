# ZETTLY EDITOR — AI AGENT DEVELOPMENT & GOVERNANCE GUIDE

Welcome, AI Engineer! This document provides authoritative development instructions, governance rules, architectural standards, and quality gates for contributing to **Zettly Editor** (`@programinglive/zettly-editor`).

---

## 1. Core Mission & Product Vision

Zettly Editor is an open-source, reusable WYSIWYG editor designed for modern React applications, offering an immersive, minimalist writing experience inspired by **Medium**.

### Primary Tenets
1. **Clean by Default:** Distraction-free canvas (`max-w-[740px]`), elegant typography, consistent vertical rhythm, zero permanent top toolbar in default `medium` preset.
2. **Contextual on Demand:** Floating bubble toolbar on text selection, floating `+` block inserter on empty lines, searchable slash commands (`/`).
3. **Command-First & Headless:** Business and document operations are headless domain logic first, testable without browser DOM dependencies.
4. **Backward Compatibility:** Existing consumers can use `preset="classic"` to retain the top sticky toolbar.

---

## 2. Mandatory DevWorkflow MCP Governance

All development work on this repository is strictly governed by the **DevWorkflow MCP Server** (`dev-workflow`).

### Rule 1: Zero Coding Before Registration
You must call `dev-workflow` `start_task` before touching or creating any files.
Provide:
- `description`: Clear English task summary.
- `type`: `feature` | `bugfix` | `refactor` | `chore`.
- `projectDir`: Absolute path to repository (`/Users/mahardhika/Documents/repo-security/zettly-editor`).
- `definitionOfDone`: Explicit, verifiable array of conditions.
- `plan`: Ordered list of 1–15 steps.
- `mermaidFlow`: Architecture or logic flowchart (`flowchart TD` / `graph TD`).

### Rule 2: Mandatory Mermaid Flow Design Gate
Every task must record an architecture or logic flowchart (`flowchart TD`). You can supply it via `mermaidFlow` in `start_task` or refine it with `create_feature_flow`. Never write code before the flow is approved and recorded in Zettly Draw Studio.

### Rule 3: Session Branch Isolation
Always create a new isolated Git feature branch per task:
```bash
git checkout -b <type>/<task-slug>
```
**Strict Prohibition:** NEVER work directly on `main`.

### Rule 4: Strict Test-Driven Development (TDD)
Follow the Red-Green-Refactor cycle:
1. Write the failing test first (`create_tests`).
2. Verify expected failure with `run_tests`.
3. Implement minimal passing code.
4. Verify tests are green with `run_tests`.

### Rule 5: Quality Gates Before Commit
Before calling `check_ready_to_commit`, verify that all quality gates pass:
```bash
npm run lint         # Zero ESLint errors or warnings
npx tsc --noEmit     # Zero TypeScript compilation errors
npm test             # 100% passing Vitest test suite
npm run build        # Clean tsup compilation to dist/
```

### Rule 6: Commit and Push via DevWorkflow
Once `check_ready_to_commit` passes, execute commits exclusively via `commit_and_push`. DevWorkflow runs Git operations which are intercepted and validated by Commiter/Husky hooks.

---

## 3. Mandatory Commiter & Release Conventions

Commit formatting and semantic release versioning are governed by **Commiter** (`@programinglive/commiter`).

### Conventional Commits
All commits must strictly follow the Conventional Commits specification:
```
<type>(<scope>): <subject>
```

Allowed types:
- `feat`: New features (bumps minor version)
- `fix`: Bug fixes (bumps patch version)
- `docs`: Documentation updates
- `refactor`: Code refactoring without behavior changes
- `test`: Adding or modifying tests
- `chore`: Maintenance, dependencies, or configuration changes
- `perf`: Performance improvements

### Release Mechanics
Releases are coordinated via DevWorkflow and executed by `scripts/release.cjs`:
```bash
npm run release:patch    # Bug fixes
npm run release:minor    # Features
npm run release:major    # Breaking changes
```

**Atomic Release Notes:** `scripts/update-release-notes.cjs` is invoked automatically via the `postchangelog` lifecycle hook in `.versionrc.json`. Do not run manual post-release commits to update `RELEASE_NOTES.md`.

---

## 4. Architecture & Directory Boundaries

```
src/
├── core/                # Pure headless domain logic (schema, AST, serializers)
├── extensions/          # TipTap extension modules (code-block, image, link, slash-menu)
├── ui/                  # UI components (bubble-menu, link-popover, floating-inserter)
├── presets/             # Composed layouts (medium.tsx, classic.tsx, bare.tsx)
├── react/               # React wrappers and context hooks
├── styles/              # Scoped CSS with custom properties (--ze-*)
├── index.ts             # Main package entrypoint
└── with-styles.ts       # Zero-config single import entrypoint
```

### Clean Boundaries
- Core schema, serializers, and validators must NOT import React, JSX, or browser globals (`window`, `document`).
- Replace browser `window.prompt` with accessible inline popovers (`src/ui/link-popover/`).
- Wrap async operations (like `onImageUpload`) in proper Promise error-handling (`try/catch`).
- Never introduce `@sentry/*` or heavy unused packages into runtime `dependencies`.

---

## 5. Security & Dependency Hygiene

1. **URL Sanitization:** Links must validate protocols (`http:`, `https:`, `mailto:`). Disallow `javascript:` or `data:text/html` URLs.
2. **Input Sanitization:** HTML strings ingested via `value` must be validated against the ProseMirror schema. Disallow execution of embedded scripts.
3. **No Vulnerable Dependencies:** Keep dependencies updated; resolve high/critical advisories immediately.
4. **Peer Dependencies:** Keep `react` and `react-dom` as flexible peer dependencies (`^18.2.0 || ^19.0.0`). Never pin peer dependencies to an exact patch release.
