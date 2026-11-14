# Headless CLI Binary (`zettly-editor`)

`@programinglive/zettly-editor` includes a standalone Node.js CLI binary executable as `zettly-editor` (or via `npx @programinglive/zettly-editor`). It provides zero-dependency offline document validation, sanitization, structural inspection, analytics, format conversion, and block command registry exploration.

## Installation & Execution

```bash
# Direct execution via npx
npx @programinglive/zettly-editor --help

# Global installation
npm install -g @programinglive/zettly-editor
zettly-editor --version
```

## Available Subcommands

### 1. `validate`
Validates a JSON or HTML document against the Zettly schema and security rules.

```bash
# Validate HTML file
zettly-editor validate document.html

# Validate JSON AST file with strict mode (fails on warnings as well as errors)
zettly-editor validate --strict --from=json document.json

# Stdin pipe with JSON output
cat dirty.html | zettly-editor validate --json -
```

### 2. `sanitize`
Sanitizes HTML or JSON AST input, stripping dangerous elements (`<script>`, inline `on*` event handlers, prototype pollution keys) and neutralizing unsafe protocols (`javascript:`, `data:`, `vbscript:`).

```bash
# Sanitize HTML from stdin and emit safe HTML
echo '<p>Hello <script>alert(1)</script></p>' | zettly-editor sanitize -

# Sanitize and convert directly to Markdown
zettly-editor sanitize input.html --to=markdown

# Sanitize and save to disk
zettly-editor sanitize input.html --output=clean.html
```

### 3. `inspect`
Inspects document validity, heading outline (table of contents), block tree distribution, and links.

```bash
zettly-editor inspect document.html
zettly-editor inspect document.html --json
```

### 4. `stats`
Calculates comprehensive document statistics: words, characters (with and without spaces), paragraphs, sentences, headings, lists, code blocks, blockquotes, images, links, and reading time.

```bash
zettly-editor stats document.html
zettly-editor stats document.html --json
```

### 5. `convert`
Converts document between HTML, JSON AST, Markdown, and plain text.

```bash
# HTML to Markdown
zettly-editor convert input.html --to=markdown

# HTML to Zettly AST JSON
zettly-editor convert input.html --to=json

# Zettly AST JSON to HTML
zettly-editor convert ast.json --from=json --to=html
```

### 6. `blocks`
Lists all registered block definitions from `defaultBlockCommands`.

```bash
zettly-editor blocks
zettly-editor blocks --json
```

## Deterministic Exit Codes

| Exit Code | Meaning |
| :--- | :--- |
| `0` | Success / Document is valid. |
| `1` | Document validation failed (errors present, or warnings present under `--strict`). |
| `2` | Command line error, invalid options, or file read error. |
