import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, test } from "vitest";
import { migrateFileToModern } from "../codemod/migrate-v1";
import { runCodemod } from "../codemod/runner";

describe("Zettly Editor Modern AST Codemod (20 Mandatory Cases)", () => {
  test("1. removes preset='classic' from <ZettlyEditor /> while preserving other props", () => {
    const input = `import React from 'react';
import { ZettlyEditor } from '@programinglive/zettly-editor';

export function EditorView({ content, setContent }: any) {
  return (
    <div className="container">
      <ZettlyEditor
        preset="classic"
        value={content}
        onChange={setContent}
      />
    </div>
  );
}`;

    const res = migrateFileToModern("test.tsx", input);
    expect(res.modified).toBe(true);
    expect(res.changes).toContain('Removed obsolete preset="classic" attribute');
    expect(res.outputCode).not.toContain('preset="classic"');
    expect(res.outputCode).toContain("value={content}");
    expect(res.outputCode).toContain("onChange={setContent}");
  });

  test("2. removes preset='medium' and EditorPreset import", () => {
    const input = `import { ZettlyEditor, EditorPreset } from '@programinglive/zettly-editor';

export function Note() {
  return <ZettlyEditor preset="medium" value="<p>hello</p>" onChange={() => {}} />;
}`;

    const res = migrateFileToModern("note.tsx", input);
    expect(res.modified).toBe(true);
    expect(res.outputCode).not.toContain("EditorPreset");
    expect(res.outputCode).not.toContain('preset="medium"');
    expect(res.outputCode).toContain("import { ZettlyEditor } from '@programinglive/zettly-editor'");
    expect(res.outputCode).toContain('<ZettlyEditor value="<p>hello</p>" onChange={() => {}} />');
  });

  test("3. rewrites named ClassicEditor import and JSX usage to ZettlyEditor", () => {
    const input = `import React from 'react';
import { ClassicEditor } from '@programinglive/zettly-editor';

export function LegacyEditor() {
  const [val, setVal] = React.useState('<p>Old</p>');
  return (
    <ClassicEditor
      value={val}
      onChange={setVal}
      className="legacy-box"
    />
  );
}`;

    const res = migrateFileToModern("legacy.tsx", input);
    expect(res.modified).toBe(true);
    expect(res.outputCode).toContain("import { ZettlyEditor } from '@programinglive/zettly-editor'");
    expect(res.outputCode).toContain("<ZettlyEditor");
    expect(res.outputCode).not.toContain("ClassicEditor");
    expect(res.outputCode).toContain('className="legacy-box"');
  });

  test("4 & 5. handles aliased component imports and renamed JSX identifiers", () => {
    const input = `import { ClassicEditor as LegacyBox } from '@programinglive/zettly-editor';

export function Aliased() {
  return <LegacyBox preset="classic" value="<p>hi</p>" onChange={() => {}}></LegacyBox>;
}`;

    const res = migrateFileToModern("aliased.tsx", input);
    expect(res.modified).toBe(true);
    expect(res.outputCode).toContain("import { ZettlyEditor } from '@programinglive/zettly-editor'");
    expect(res.outputCode).toContain('<ZettlyEditor value="<p>hi</p>" onChange={() => {}}></ZettlyEditor>');
    expect(res.outputCode).not.toContain("LegacyBox");
  });

  test("6. handles multiple editor instances in one file", () => {
    const input = `import { ClassicEditor, ZettlyEditor, BubbleToolbar } from '@programinglive/zettly-editor';

export function Dual() {
  return (
    <div>
      <ClassicEditor value="1" onChange={() => {}} />
      <ZettlyEditor preset="classic" value="2" onChange={() => {}} />
      <ZettlyEditor preset="medium" value="3" onChange={() => {}} />
    </div>
  );
}`;

    const res = migrateFileToModern("dual.tsx", input);
    expect(res.modified).toBe(true);
    expect(res.outputCode).not.toContain("ClassicEditor");
    expect(res.outputCode).not.toContain("preset=");
    expect(res.outputCode).toContain("ZettlyEditor");
    expect(res.outputCode).toContain("BubbleToolbar");
  });

  test("7, 19. processes multiple source files and supports dry-run mode", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ze-codemod-multi-"));
    try {
      const f1 = path.join(tmpDir, "A.tsx");
      const f2 = path.join(tmpDir, "B.tsx");
      const src1 = `import { ClassicEditor } from '@programinglive/zettly-editor';\nexport const A = () => <ClassicEditor value="" onChange={() => {}} />;`;
      const src2 = `import { ZettlyEditor } from '@programinglive/zettly-editor';\nexport const B = () => <ZettlyEditor preset="classic" value="" onChange={() => {}} />;`;
      fs.writeFileSync(f1, src1, "utf8");
      fs.writeFileSync(f2, src2, "utf8");

      const drySummary = runCodemod([tmpDir, "--dry-run"]);
      expect(drySummary.processed).toBe(2);
      expect(drySummary.modified).toBe(2);
      expect(drySummary.failed).toBe(0);
      expect(fs.readFileSync(f1, "utf8")).toBe(src1);
      expect(fs.readFileSync(f2, "utf8")).toBe(src2);

      const writeSummary = runCodemod([tmpDir]);
      expect(writeSummary.processed).toBe(2);
      expect(writeSummary.modified).toBe(2);
      expect(writeSummary.failed).toBe(0);
      expect(fs.readFileSync(f1, "utf8")).toContain("<ZettlyEditor");
      expect(fs.readFileSync(f2, "utf8")).not.toContain("preset=");
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test("8 & 9. preserves unrelated props and controlled editor state", () => {
    const input = `import { useState } from 'react';
import { ZettlyEditor } from '@programinglive/zettly-editor';

export function Controlled() {
  const [html, setHtml] = useState("<p>init</p>");
  return (
    <ZettlyEditor
      preset="classic"
      value={html}
      onChange={(next) => setHtml(next)}
      onJsonChange={(doc) => console.log(doc)}
      className="custom"
    />
  );
}`;
    const res = migrateFileToModern("controlled.tsx", input);
    expect(res.modified).toBe(true);
    expect(res.outputCode).toContain('const [html, setHtml] = useState("<p>init</p>");');
    expect(res.outputCode).toContain("onJsonChange={(doc) => console.log(doc)}");
    expect(res.outputCode).toContain('className="custom"');
    expect(res.outputCode).not.toContain('preset="classic"');
  });

  test("10. refuses ambiguous dynamic preset values and emits a warning", () => {
    const input = `import { ZettlyEditor } from '@programinglive/zettly-editor';

export function Dynamic({ customPreset }: any) {
  return <ZettlyEditor preset={customPreset} value="" onChange={() => {}} />;
}`;

    const res = migrateFileToModern("dynamic.tsx", input);
    expect(res.modified).toBe(false);
    expect(res.warnings.some((w) => w.includes("Dynamic preset expression detected"))).toBe(true);
    expect(res.outputCode).toBe(input);
  });

  test("11. rewrites re-exported ClassicEditor and removes EditorPreset re-exports", () => {
    const input = `export { ClassicEditor, EditorPreset } from '@programinglive/zettly-editor';
export type { EditorPreset as LegacyPreset } from '@programinglive/zettly-editor';
`;
    const res = migrateFileToModern("reexport.ts", input);
    expect(res.modified).toBe(true);
    expect(res.outputCode).toContain("export { ZettlyEditor } from '@programinglive/zettly-editor';");
    expect(res.outputCode).not.toContain("ClassicEditor");
    expect(res.outputCode).not.toContain("EditorPreset");
  });

  test("12. removes type-only EditorPreset imports cleanly without leaving empty braces", () => {
    const input = `import type { EditorPreset } from '@programinglive/zettly-editor';
import { ZettlyEditor } from '@programinglive/zettly-editor';

export function App() {
  return <ZettlyEditor value="" onChange={() => {}} />;
}`;
    const res = migrateFileToModern("typeonly.tsx", input);
    expect(res.modified).toBe(true);
    expect(res.outputCode).not.toContain("EditorPreset");
    expect(res.outputCode).not.toContain("import type {");
    expect(res.outputCode).toContain("import { ZettlyEditor } from '@programinglive/zettly-editor';");
  });

  test("13. preserves JSX spread attributes on migrated components", () => {
    const input = `import { ClassicEditor } from '@programinglive/zettly-editor';

export function Spread(props: any) {
  return <ClassicEditor {...props} preset="classic" />;
}`;
    const res = migrateFileToModern("spread.tsx", input);
    expect(res.modified).toBe(true);
    expect(res.outputCode).toContain("<ZettlyEditor {...props} />");
  });

  test("14. does not touch unrelated similarly named components or files without Zettly imports", () => {
    const unrelated = `import React from 'react';
import { ClassicEditor } from 'some-other-unrelated-package';

export function Custom() {
  return <ClassicEditor preset="classic" />;
}`;

    const res = migrateFileToModern("unrelated.tsx", unrelated);
    expect(res.modified).toBe(false);
    expect(res.changes.length).toBe(0);
    expect(res.outputCode).toBe(unrelated);
  });

  test("15. preserves comments and original formatting", () => {
    const input = `// Top header comment
import {
  ClassicEditor, // legacy import
  ZettlyEditor,
} from '@programinglive/zettly-editor';

/* Block comment */
export function Formatted() {
  return <ClassicEditor preset="classic" value="<p>ok</p>" onChange={() => {}} />;
}`;
    const res = migrateFileToModern("comments.tsx", input);
    expect(res.modified).toBe(true);
    expect(res.outputCode).toContain("// Top header comment");
    expect(res.outputCode).toContain("/* Block comment */");
  });

  test("16. is idempotent: running against already migrated code produces no changes", () => {
    const migrated = `import React from 'react';
import { ZettlyEditor } from '@programinglive/zettly-editor';

export function Modern() {
  return <ZettlyEditor value="<p>safe</p>" onChange={() => {}} />;
}`;

    const res1 = migrateFileToModern("modern.tsx", migrated);
    expect(res1.modified).toBe(false);
    expect(res1.outputCode).toBe(migrated);

    const res2 = migrateFileToModern("modern.tsx", res1.outputCode);
    expect(res2.modified).toBe(false);
    expect(res2.outputCode).toBe(migrated);
  });

  test("17. refuses invalid TSX syntax and emits explicit warning", () => {
    const broken = `import { ClassicEditor } from '@programinglive/zettly-editor';
export function Broken() {
  return <ClassicEditor preset="classic" value={ ;
}`;
    const res = migrateFileToModern("broken.tsx", broken);
    expect(res.modified).toBe(false);
    expect(res.warnings.some((w) => w.includes("Syntax error detected"))).toBe(true);
    expect(res.outputCode).toBe(broken);
  });

  test("18 & 20. handles unwritable source files and partial migration failure gracefully", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ze-codemod-perm-"));
    const writableFile = path.join(tmpDir, "Writable.tsx");
    const readonlyFile = path.join(tmpDir, "Readonly.tsx");
    try {
      fs.writeFileSync(
        writableFile,
        `import { ClassicEditor } from '@programinglive/zettly-editor';\nexport const W = () => <ClassicEditor value="" onChange={() => {}} />;`,
        "utf8"
      );
      fs.writeFileSync(
        readonlyFile,
        `import { ClassicEditor } from '@programinglive/zettly-editor';\nexport const R = () => <ClassicEditor value="" onChange={() => {}} />;`,
        "utf8"
      );
      fs.chmodSync(readonlyFile, 0o444);

      const summary = runCodemod([tmpDir]);
      expect(summary.processed).toBe(2);
      expect(summary.modified).toBe(1);
      expect(summary.failed).toBe(1);
      expect(summary.errors[0]?.filePath).toBe(readonlyFile);
      expect(fs.readFileSync(writableFile, "utf8")).toContain("<ZettlyEditor");
    } finally {
      fs.chmodSync(readonlyFile, 0o644);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test("22. executes compiled ESM dist/codemod.js subprocess cleanly", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "zettly-codemod-bin-"));
    const targetFile = path.join(tmpDir, "LegacyApp.tsx");
    const codemodBin = path.resolve(__dirname, "../../dist/codemod.js");

    try {
      fs.writeFileSync(
        targetFile,
        `import { ClassicEditor } from "@programinglive/zettly-editor";\nexport const App = () => <ClassicEditor value="<p>Hi</p>" onChange={() => {}} />;`,
        "utf8"
      );

      const res = spawnSync("node", [codemodBin, targetFile, "--dry-run"], {
        encoding: "utf8",
      });
      expect(res.status, res.stderr).toBe(0);
      expect(res.stdout).toContain("[MODIFIED]");
      expect(res.stdout).toContain("LegacyApp.tsx");
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
