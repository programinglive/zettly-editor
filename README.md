# @programinglive/zettly-editor

Shadcn-styled TipTap editor for Zettly todo/notes apps.

## Installation

```bash
npm install @programinglive/zettly-editor @tiptap/react @tiptap/starter-kit react react-dom
```

### Laravel + Vite setup (consumer project)

When integrating inside a Laravel project (Jetstream, Inertia, Breeze, etc.), adjust *that* project's `vite.config.js` to point at the published bundle. The snippet below assumes you already have Laravel's default `laravel-vite-plugin` installed—nothing needs to be added to this library package.

Add the aliases so Laravel can compile the editor and styles:

```ts
// vite.config.js
import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    laravel({
      input: "resources/js/app.jsx",
      refresh: true,
    }),
    react(),
  ],
  resolve: {
    alias: {
      "@programinglive/zettly-editor": path.resolve(
        __dirname,
        "node_modules/@programinglive/zettly-editor/dist/index.mjs"
      ),
      "zettly-editor/styles": path.resolve(
        __dirname,
        "node_modules/@programinglive/zettly-editor/dist/index.css"
      ),
    },
  },
});
```

Then import the stylesheet inside `resources/js/app.jsx` (or your SPA entry file):

```tsx
import "zettly-editor/styles";
```

## Usage

```tsx
import { useState } from "react";
import { ZettlyEditor } from "@programinglive/zettly-editor";

export function MyEditor() {
  const [value, setValue] = useState("<p>Hello Zettly</p>");

  return (
    <ZettlyEditor
      value={value}
      onChange={(nextValue) => setValue(nextValue)}
    />
  );
}
```

The editor ships with opinionated defaults that match the example playground. Bold, italic, strike, lists, blockquotes, and links all have styling baked in so you can see how each toolbar action behaves immediately.

The editable surface uses the full container width and a comfortable minimum height, matching the mockups shown in the docs.

## Syntax highlighting

Code blocks use `@tiptap/extension-code-block-lowlight` together with `lowlight` and `highlight.js` for layered syntax highlighting. `lowlight` ships with a curated set of languages pre-registered inside `src/components/editor/code-block-config.ts`, including JavaScript, TypeScript, JSON, Bash, SQL, Go, PHP, Rust, Swift, Kotlin, and more. The default toolbar exposes a code-block toggle so editors can insert and format blocks instantly. While editing a block, press `Shift+Enter` / `Mod+Enter` or hit `Enter` on an empty line at the end to exit back to a normal paragraph.

To support an additional language, register the Highlight.js grammar before mounting the editor:

```ts
import python from "highlight.js/lib/languages/python";
import { lowlight } from "lowlight";

lowlight.registerLanguage("python", python);
```

Styling is handled in `src/components/editor/code-highlight.css`. Override the `.hljs` token classes or append your own theme to align with your design system. The default palette now differentiates between light and dark surfaces, so code blocks remain legible regardless of theme. The example playground demonstrates how to render and theme read-only snippets via `example/src/syntax-highlighter.tsx`.

## Example Playground

- **Run locally**
  ```bash
  npm run example:dev # served at http://localhost:5183
  ```
- ✨ Rich text editing powered by [tiptap](https://tiptap.dev/)
- 🎨 Beautiful default toolbar built with [shadcn/ui](https://ui.shadcn.com/)
- 🧰 Fully controlled component with single data flow
- 🪝 Permission-aware commands out of the box
- 🧪 Tested with React Testing Library + Vitest
- 🌈 Syntax highlighting for code blocks powered by Highlight.js

## Props

| Name | Type | Description |
| --- | --- | --- |
| `value` | `string` | Controlled HTML content. |
| `onChange` | `(value: string, meta: EditorMeta) => void` | Receive updates plus meta information. |
| `extensions` | `AnyExtension[]` | Additional TipTap extensions. |
| `commands` | `CommandDefinition[]` | Custom toolbar commands. |
| `permissions` | `EditorPermissions` | Control read-only/link behavior. |
| `messages` | `Partial<EditorMessages>` | Override UI copy. |
| `toolbar` | `(props: ToolbarRenderProps) => ReactNode` | Custom toolbar renderer. |
| `className` | `string` | Wrapper class. |
| `editorClassName` | `string` | Content area class. |
| `autoFocus` | `boolean` | Focus editor on mount. |
| `debug` | `boolean` | Print verbose lifecycle + toolbar logs to the console. |
| `onDebugEvent` | `(event: DebugEvent) => void` | Receive structured lifecycle/toolbar events for remote logging. |

### Debug logging

Set the `debug` prop to `true` during integration to surface rich console output from the editor. This logs TipTap lifecycle callbacks (`onCreate`, `onUpdate`, `onTransaction`, `onSelectionUpdate`) and the toolbar's active command state, which is especially helpful when diagnosing highlight/selection issues in downstream apps. Remember to toggle it off for production builds.

#### Forwarding debug events to a backend

When you need to capture events centrally (for example in `https://zettly-debug.programinglive.com/`), provide an `onDebugEvent` callback. The editor emits structured payloads describing lifecycle changes, transactions, selections, and toolbar state.

```tsx
import { ZettlyEditor, type DebugEvent } from "@programinglive/zettly-editor";

const sendDebugEvent = (event: DebugEvent) => {
  fetch("https://zettly-debug.programinglive.com/api/editor-debug", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": import.meta.env.VITE_ZETTLY_DEBUG_KEY,
    },
    body: JSON.stringify({
      ...event,
      app: "todo-app",
      noteId: currentNoteId,
      userId: currentUser.id,
    }),
    keepalive: true,
  });
};

<ZettlyEditor value={value} onChange={handleChange} debug onDebugEvent={sendDebugEvent} />;
```

Each event includes a timestamp, selection JSON, HTML snapshot (where applicable), and active toolbar commands. This makes it easy to store, replay, or alert on anomalies in an external service.

#### Laravel logging example

Create a dedicated channel in `config/logging.php`:

```php
'channels' => [
    // ...
    'zettly' => [
        'driver' => 'single',
        'path' => storage_path('logs/zettly-editor.log'),
        'level' => 'debug',
    ],
],
```

Then wire an ingest route:

```php
// routes/api.php
Route::post('/editor-debug', [EditorDebugController::class, 'store'])->middleware('auth:sanctum');

// app/Http/Controllers/EditorDebugController.php
class EditorDebugController extends Controller
{
    public function store(EditorDebugRequest $request)
    {
        Log::channel('zettly')->info('zettly editor debug', $request->validated());
        return response()->json(['ok' => true]);
    }
}
```

From there you can tail `storage/logs/zettly-editor.log`, ship the file to your APM provider, or build a dashboard to inspect events.

## Integrating with a Shadcn Project

### 1. Install Dependencies

```bash
npm install @programinglive/zettly-editor @tiptap/react @tiptap/starter-kit lucide-react
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2. Configure Tailwind Tokens

Add the content globs and CSS variables used by `ZettlyEditor` inside your `tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

Import the Tailwind entry file in your app layout:

```tsx
// app/layout.tsx (Next.js)
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-background text-foreground">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
```

### 3. Render the Editor with Single Data Flow

```tsx
import { useState } from "react";
import { ZettlyEditor, type EditorMeta } from "@programinglive/zettly-editor";

export function NoteEditor() {
  const [value, setValue] = useState("<p>Start writing...</p>");
  const [meta, setMeta] = useState<EditorMeta | null>(null);

  return (
    <div className="space-y-4">
      <ZettlyEditor
        value={value}
        onChange={(next, nextMeta) => {
          setValue(next);
          setMeta(nextMeta);
        }}
      />
      <pre className="rounded-md bg-muted p-4 text-xs">{value}</pre>
      <p className="text-sm text-muted-foreground">Words: {meta?.words ?? 0}</p>
    </div>
  );
}
```

## Persisting Editor Output

`ZettlyEditor` emits HTML through the `onChange` callback. Save this string in your preferred backend. Below are minimal examples for popular databases. All examples assume a Next.js 14 route handler, but you can adapt them to Express/Fastify easily.

### Prisma (MySQL, PostgreSQL, SQLite, PlanetScale, Supabase)

**Schema:**

```prisma
// prisma/schema.prisma
model Note {
  id        String   @id @default(cuid())
  title     String
  content   String   @db.LongText
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Route handler:**

```ts
// app/api/notes/route.ts
import { NextResponse } from "next/server";
import { prisma } from "~/lib/prisma";

export async function POST(request: Request) {
  const { title, content } = await request.json();
  const note = await prisma.note.create({ data: { title, content } });
  return NextResponse.json(note, { status: 201 });
}

export async function GET() {
  const notes = await prisma.note.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(notes);
}
```

**Client usage:**

```tsx
async function saveNote(value: string) {
  await fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Daily Log", content: value }),
  });
}
```

### MySQL (mysql2)

```ts
// src/lib/mysql.ts
import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  uri: process.env.MYSQL_DATABASE_URL!,
});

// app/api/notes/mysql/route.ts
import { NextResponse } from "next/server";
import { pool } from "~/lib/mysql";

export async function POST(request: Request) {
  const { title, content } = await request.json();
  await pool.execute("INSERT INTO notes (title, content_html) VALUES (?, ?)", [title, content]);
  return NextResponse.json({ ok: true });
}
```

### PostgreSQL (pg)

```ts
// src/lib/postgres.ts
import { Pool } from "pg";

export const pgPool = new Pool({ connectionString: process.env.POSTGRES_URL });

// app/api/notes/postgres/route.ts
import { NextResponse } from "next/server";
import { pgPool } from "~/lib/postgres";

export async function POST(request: Request) {
  const { title, content } = await request.json();
  await pgPool.query("INSERT INTO notes (title, content_html) VALUES ($1, $2)", [title, content]);
  return NextResponse.json({ ok: true });
}
```

### MongoDB (mongodb driver)

```ts
// src/lib/mongo.ts
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);
export const mongo = client.db("zettly").collection("notes");

// app/api/notes/mongo/route.ts
import { NextResponse } from "next/server";
import { mongo } from "~/lib/mongo";

export async function POST(request: Request) {
  const { title, content } = await request.json();
  await mongo.insertOne({ title, content, createdAt: new Date() });
  return NextResponse.json({ ok: true });
}
```

### Firebase Firestore

```ts
// src/lib/firebase-admin.ts
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const app = getApps()[0] ?? initializeApp({
  credential: cert(JSON.parse(process.env.FIREBASE_ADMIN_KEY!)),
});

export const firestore = getFirestore(app);

// app/api/notes/firebase/route.ts
import { NextResponse } from "next/server";
import { firestore } from "~/lib/firebase-admin";

export async function POST(request: Request) {
  const { title, content } = await request.json();
  await firestore.collection("notes").add({ title, content, createdAt: Date.now() });
  return NextResponse.json({ ok: true });
}
```

### Loading Saved Content

When you fetch stored HTML, feed it back into the editor as `value`.

```tsx
const note = await fetch("/api/notes/123").then((res) => res.json());

return <ZettlyEditor value={note.content} onChange={handleChange} />;
```

## Development

```bash
npm install
npm run dev
```

Build outputs to `dist/` via `tsup`.
