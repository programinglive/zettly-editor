import { describe, expect, test } from "vitest";
import { migrateFileToModern } from "../codemod/migrate-v1";

describe("Zettly Editor Modern AST Codemod", () => {
  test("removes preset='classic' from <ZettlyEditor /> while preserving other props", () => {
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

  test("removes preset='medium' and EditorPreset import", () => {
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

  test("rewrites ClassicEditor import and JSX usage to ZettlyEditor", () => {
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

  test("handles combined import with both ClassicEditor and ZettlyEditor cleanly", () => {
    const input = `import { ClassicEditor, ZettlyEditor, BubbleToolbar } from '@programinglive/zettly-editor';

export function Dual() {
  return (
    <div>
      <ClassicEditor value="1" onChange={() => {}} />
      <ZettlyEditor preset="classic" value="2" onChange={() => {}} />
    </div>
  );
}`;

    const res = migrateFileToModern("dual.tsx", input);
    expect(res.modified).toBe(true);
    expect(res.outputCode).not.toContain("ClassicEditor");
    expect(res.outputCode).toContain("ZettlyEditor");
    expect(res.outputCode).toContain("BubbleToolbar");
  });

  test("refuses ambiguous dynamic preset values and emits a warning", () => {
    const input = `import { ZettlyEditor } from '@programinglive/zettly-editor';

export function Dynamic({ customPreset }: any) {
  return <ZettlyEditor preset={customPreset} value="" onChange={() => {}} />;
}`;

    const res = migrateFileToModern("dynamic.tsx", input);
    expect(res.modified).toBe(false);
    expect(res.warnings.some((w) => w.includes("Dynamic preset expression detected"))).toBe(true);
    expect(res.outputCode).toBe(input);
  });

  test("does not touch unrelated JSX tags or files without Zettly imports", () => {
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

  test("is idempotent: running against already migrated code produces no changes", () => {
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
});
