import type { Editor } from "@tiptap/core";
import type { ZettlyNodeType } from "../types/document";

export type BlockCommandCategory = "basic" | "lists" | "advanced";

export interface BlockCommandItem {
  id: string;
  title: string;
  description: string;
  searchTerms: string[];
  iconName: string;
  category: BlockCommandCategory;
  shortcut?: string;
  schemaNode?: {
    type: ZettlyNodeType;
    attrs?: Record<string, unknown>;
  };
  isEnabled?: (editor: Editor) => boolean;
  execute: (editor: Editor) => void;
}
