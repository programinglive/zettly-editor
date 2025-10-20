import React from "react";

import { ZettlyEditor, type DebugEvent } from "@programinglive/zettly-editor";
import { SyntaxHighlighter } from "./syntax-highlighter";
import Logo from "./assets/logo_zettly_editor.png";

const initialContent = `<h1>Zettly Editor</h1>
<p>
  This playground showcases every toolbar button. Try toggling each option below to see how the editor responds.
</p>
<p>
  <strong>Bold example</strong> • <em>Italic example</em> • <span style="text-decoration: line-through;">Strike example</span> •
  <a href="https://programinglive.com" target="_blank" rel="noopener noreferrer">Link example</a>
</p>
<blockquote>
  “This blockquote is ready for inspiration. Edit it or add your own quote to see the formatting update in preview mode.”
</blockquote>
<h2>Code Block with Syntax Highlighting</h2>
<p>The editor now supports syntax highlighting for code blocks. Try the code block button in the toolbar!</p>
<pre><code class="language-javascript">// Example JavaScript code
function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return true;
}

const user = "Developer";
greet(user);</code></pre>
<pre><code class="language-typescript">// TypeScript example
interface User {
  id: number;
  name: string;
  email: string;
}

const createUser = (data: User): User => {
  return { ...data };
};</code></pre>
<ul>
  <li>Bullet list item one</li>
  <li>Bullet list item two</li>
  <li>Bullet list item three</li>
</ul>
<ol>
  <li>Ordered list item one</li>
  <li>Ordered list item two</li>
  <li>Ordered list item three</li>
</ol>`;

export function App() {
  const [value, setValue] = React.useState(initialContent);
  const [words, setWords] = React.useState(0);
  const [characters, setCharacters] = React.useState(0);
  const [mode, setMode] = React.useState<"edit" | "preview">("edit");
  const [theme, setTheme] = React.useState<"light" | "dark">(() => {
    if (typeof window === "undefined") {
      return "light";
    }
    const stored = window.localStorage.getItem("zettly-theme");
    if (stored === "light" || stored === "dark") {
      return stored;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const [debugEnabled, setDebugEnabled] = React.useState(false);

  const handleDebugEvent = React.useCallback((event: DebugEvent) => {
    if (!debugEnabled) {
      return;
    }
    console.log("zettly debug event", event);
  }, [debugEnabled]);

  React.useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    window.localStorage.setItem("zettly-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const menuItems = React.useMemo(
    () => [
      { id: "playground", label: "Playground" },
      { id: "metadata", label: "Metadata" },
      { id: "output", label: "Output" },
      { id: "integration", label: "Integration" },
    ],
    []
  );

  const handleNavClick = React.useCallback((sectionId: string) => {
    if (typeof window === "undefined") {
      return;
    }
    const target = document.getElementById(sectionId);
    if (!target) {
      return;
    }
    const headerOffset = 120;
    const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  const navButtonClass =
    "rounded-full px-3 py-1 text-sm font-medium text-zinc-600 transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:text-zinc-300";

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-indigo-50 pb-20 text-zinc-900 transition-colors duration-300 dark:from-slate-950 dark:via-slate-950 dark:to-black dark:text-zinc-100">
      <header className="sticky top-0 z-20 border-b border-white/30 bg-white/70 backdrop-blur transition-colors duration-200 supports-[backdrop-filter]:bg-white/40 dark:border-zinc-800/60 dark:bg-zinc-950/70 dark:supports-[backdrop-filter]:bg-zinc-900/60">
        <nav className="mx-auto flex max-w-4xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <img src={Logo} alt="Zettly Editor logo" className="h-10 w-auto rounded" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={navButtonClass}
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={toggleTheme}
              className={`${navButtonClass} font-semibold`}
            >
              {theme === "light" ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>
        </nav>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-10" id="playground">
        <section className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-100">Zettly Editor Playground</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Controlled example using the published component from <code>@programinglive/zettly-editor</code>.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <div className="inline-flex w-fit items-center gap-1 rounded-full border border-zinc-200 bg-white p-1 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <button
              type="button"
              onClick={() => setMode("edit")}
              className="rounded-full px-4 py-1 text-sm font-medium transition data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              data-state={mode === "edit" ? "on" : "off"}
              aria-pressed={mode === "edit"}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setMode("preview")}
              className="rounded-full px-4 py-1 text-sm font-medium transition data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              data-state={mode === "preview" ? "on" : "off"}
              aria-pressed={mode === "preview"}
            >
              Preview
            </button>
          </div>

          {mode === "edit" ? (
            <ZettlyEditor
              value={value}
              onChange={(nextValue, meta) => {
                setValue(nextValue);
                setWords(meta.words);
                setCharacters(meta.characters);
              }}
              messages={{ placeholder: "Start jotting your notes..." }}
              debug={debugEnabled}
              onDebugEvent={handleDebugEvent}
              onDebugToggle={setDebugEnabled}
            />
          ) : (
            <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition dark:border-zinc-800 dark:bg-zinc-900">
              <header className="mb-4 flex items-center justify-between text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                <span>Preview</span>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">Read only</span>
              </header>
              <div
                className="space-y-4 text-base leading-relaxed text-zinc-800 dark:text-zinc-100 [&_a]:text-primary [&_a]:underline [&_a:hover]:text-primary/80 [&_blockquote]:border-l-4 [&_blockquote]:border-zinc-200 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h1]:text-3xl [&_h1]:font-semibold [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:text-xl [&_h3]:font-semibold [&_li]:marker:text-primary [&_ol]:ml-6 [&_ol]:list-decimal [&_ul]:ml-6 [&_ul]:list-disc [&_pre]:rounded-lg [&_pre]:bg-zinc-100 [&_pre]:text-zinc-900 dark:[&_pre]:bg-slate-900 dark:[&_pre]:text-slate-100 [&_pre]:p-4 [&_pre]:overflow-x-auto [&_code]:font-mono [&_code]:text-sm"
                dangerouslySetInnerHTML={{ __html: value }}
              />
            </article>
          )}
        </section>

        <section
          className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          id="metadata"
        >
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Metadata</h3>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">Characters: {characters}</p>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">Words: {words}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Value length: {value.length} characters.
          </p>
        </section>

        <section
          className="space-y-3 rounded-lg border border-dashed border-zinc-300 bg-zinc-50/60 p-4 dark:border-zinc-700 dark:bg-zinc-900/50"
          id="output"
        >
          <header className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Editor Output</h3>
            <span className="text-xs uppercase tracking-wide text-zinc-500">HTML stored in DB</span>
          </header>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Persist the string below to your backend. When you need to display the note again, pass it back into
            <code className="mx-1 rounded bg-zinc-200 px-1 py-0.5 text-xs dark:bg-zinc-800">ZettlyEditor</code> as the
            <code className="mx-1 rounded bg-zinc-200 px-1 py-0.5 text-xs dark:bg-zinc-800">value</code> prop.
          </p>
          <pre className="max-h-64 overflow-auto rounded-md bg-zinc-100 p-4 text-xs text-zinc-800 dark:bg-slate-900 dark:text-slate-100">
{value.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
          </pre>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white/70 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Toolbar quick actions
          </h3>
          <ul className="mt-2 space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
            <li>
              <strong>Heading select:</strong> Switch between <em>Paragraph</em> and <code>Heading 1-6</code> for structured
              titles.
            </li>
            <li>
              <strong>Bold:</strong> Highlight a word or phrase and hit the <strong>B</strong> button or press <kbd>Ctrl</kbd>
              / <kbd>Cmd</kbd> + <kbd>B</kbd>.
            </li>
            <li>
              <strong>Italic:</strong> Emphasize text with <strong>I</strong> or <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> +
              <kbd>I</kbd>.
            </li>
            <li>
              <strong>Strike:</strong> Mark revisions with the strikethrough toggle (<kbd>Ctrl</kbd> / <kbd>Cmd</kbd> +
              <kbd>Shift</kbd> + <kbd>X</kbd>).
            </li>
            <li>
              <strong>Bullet list:</strong> Quickly outline ideas using unordered lists.
            </li>
            <li>
              <strong>Ordered list:</strong> Create numbered steps or procedures.
            </li>
            <li>
              <strong>Blockquote:</strong> Call attention to quotes or pull statements.
            </li>
            <li>
              <strong>Code block:</strong> Insert formatted snippets with syntax highlighting.
            </li>
            <li>
              <strong>Link:</strong> Add or remove hyperlinks—prompted input respects permissions.
            </li>
            <li>
              <strong>Debug toggle:</strong> Enable the 🐞 button to stream lifecycle events to the console.
            </li>
          </ul>
        </section>

        <section
          className="space-y-6 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          id="integration"
        >
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Integration Tutorial</h3>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            Store the editor output as a <strong>string</strong> or <strong>text/blob</strong> column in your database. Use
            the largest text type available to avoid truncation:
          </p>
          <ul className="grid gap-3 rounded-md border border-zinc-100 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300 sm:grid-cols-2">
            <li>
              <strong>MySQL:</strong> <code>LONGTEXT</code> or <code>TEXT</code>
            </li>
            <li>
              <strong>PostgreSQL:</strong> <code>TEXT</code>
            </li>
            <li>
              <strong>MongoDB:</strong> <code>string</code> field (BSON)
            </li>
            <li>
              <strong>Firebase Firestore:</strong> <code>string</code> field
            </li>
            <li>
              <strong>Prisma:</strong> <code>String @db.LongText</code> (MySQL) or plain <code>String</code> (PostgreSQL)
            </li>
          </ul>
          <div className="space-y-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            <div>
              <h4 className="text-base font-medium text-zinc-900 dark:text-zinc-100">1. Install dependencies</h4>
              <SyntaxHighlighter
                code={`npm install @programinglive/zettly-editor @tiptap/react @tiptap/starter-kit lucide-react
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p`}
                language="bash"
              />
            </div>
            <div>
              <h4 className="text-base font-medium text-zinc-900 dark:text-zinc-100">2. Tailwind config essentials</h4>
              <SyntaxHighlighter
                code={`import type { Config } from "tailwindcss";

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

export default config;`}
                language="typescript"
              />
            </div>
            <div>
              <h4 className="text-base font-medium text-zinc-900 dark:text-zinc-100">3. Render with single data flow</h4>
              <SyntaxHighlighter
                code={`import { useState } from "react";
import { ZettlyEditor } from "@programinglive/zettly-editor";

export function NoteEditor() {
  const [value, setValue] = useState("<p>Start writing...</p>");

  return (
    <ZettlyEditor
      value={value}
      onChange={(next) => setValue(next)}
    />
  );
}`}
                language="typescript"
              />
            </div>
            <div className="space-y-3">
              <h4 className="text-base font-medium text-zinc-900 dark:text-zinc-100">4. Save HTML to your database</h4>
              <p>Pick the backend stack that matches your project. Each snippet expects <code>content</code> to be the editor output.</p>
              <details className="rounded-md border border-zinc-200 bg-zinc-100/40 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
                <summary className="cursor-pointer text-sm font-semibold text-zinc-800 dark:text-zinc-200">Prisma (MySQL/PostgreSQL)</summary>
                <SyntaxHighlighter
                  code={`// prisma/schema.prisma
model Note {
  id        String   @id @default(cuid())
  title     String
  content   String   @db.LongText
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// app/api/notes/route.ts
import { NextResponse } from "next/server";
import { prisma } from "~/lib/prisma";

export async function POST(request: Request) {
  const { title, content } = await request.json();
  const note = await prisma.note.create({ data: { title, content } });
  return NextResponse.json(note, { status: 201 });
}`}
                language="typescript"
              />
            </details>
            <details className="rounded-md border border-zinc-200 bg-zinc-100/40 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
              <summary className="cursor-pointer text-sm font-semibold text-zinc-800 dark:text-zinc-200">MySQL (mysql2)</summary>
              <SyntaxHighlighter
                code={`import mysql from "mysql2/promise";

export const pool = mysql.createPool({ uri: process.env.MYSQL_DATABASE_URL! });

export async function POST(request: Request) {
  const { title, content } = await request.json();
  await pool.execute("INSERT INTO notes (title, content_html) VALUES (?, ?)", [title, content]);
  return Response.json({ ok: true });
}`}
                language="typescript"
              />
            </details>
            <details className="rounded-md border border-zinc-200 bg-zinc-100/40 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
              <summary className="cursor-pointer text-sm font-semibold text-zinc-800 dark:text-zinc-200">PostgreSQL (pg)</summary>
              <SyntaxHighlighter
                code={`import { Pool } from "pg";

export const pgPool = new Pool({ connectionString: process.env.POSTGRES_URL });

export async function POST(request: Request) {
  const { title, content } = await request.json();
  await pgPool.query("INSERT INTO notes (title, content_html) VALUES ($1, $2)", [title, content]);
  return Response.json({ ok: true });
}`}
                language="typescript"
              />
            </details>
            <details className="rounded-md border border-zinc-200 bg-zinc-100/40 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
              <summary className="cursor-pointer text-sm font-semibold text-zinc-800 dark:text-zinc-200">MongoDB</summary>
              <SyntaxHighlighter
                code={`import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);
const collection = client.db("zettly").collection("notes");

export async function POST(request: Request) {
  const { title, content } = await request.json();
  await collection.insertOne({ title, content, createdAt: new Date() });
  return Response.json({ ok: true });
}`}
                language="typescript"
              />
            </details>
            <details className="rounded-md border border-zinc-200 bg-zinc-100/40 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
              <summary className="cursor-pointer text-sm font-semibold text-zinc-800 dark:text-zinc-200">Firebase Firestore</summary>
              <SyntaxHighlighter
                code={`import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const app = getApps()[0] ?? initializeApp({
  credential: cert(JSON.parse(process.env.FIREBASE_ADMIN_KEY!)),
});

export const firestore = getFirestore(app);

export async function POST(request: Request) {
  const { title, content } = await request.json();
  await firestore.collection("notes").add({ title, content, createdAt: Date.now() });
  return Response.json({ ok: true });
}`}
                language="typescript"
              />
            </details>
          </div>
          <div>
            <h4 className="text-base font-medium text-zinc-900 dark:text-zinc-100">5. Restore saved HTML</h4>
            <SyntaxHighlighter
              code={`const note = await fetch("/api/notes/123").then((res) => res.json());

return <ZettlyEditor value={note.content} onChange={(next) => setValue(next)} />;`}
              language="typescript"
            />
          </div>
        </div>
      </section>
      </main>
    </div>
  );
}
