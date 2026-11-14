# Zettly Document Schema & AST Specification (v1)

This specification defines the canonical, versioned JSON AST representation for **Zettly Editor** (`@programinglive/zettly-editor`).

## 1. Document Envelope (`ZettlyDocumentV1`)

```typescript
export interface ZettlyDocumentV1 {
  schemaVersion: 1;
  doc: {
    type: 'doc';
    content: ZettlyDocumentNode[];
  };
}
```

## 2. Declarative Schema Node Descriptors on `BlockCommandRegistry`

Each block command registered in `BlockCommandRegistry` can optionally expose a `schemaNode` descriptor mapping the command to its ProseMirror AST node:

```typescript
export interface BlockCommandItem {
  id: string;
  title: string;
  category: BlockCommandCategory;
  schemaNode?: {
    type: ZettlyNodeType;
    attrs?: Record<string, unknown>;
  };
}
```

This allows headless operations (`validate`, `inspect`, `convert`) to validate documents against the registry without instantiating browser DOM globals or React components.
