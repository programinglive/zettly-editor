import type { Editor } from "@tiptap/core";

export type BlockCommandCategory = "basic" | "lists" | "advanced";

export interface BlockCommandItem {
  id: string;
  title: string;
  description: string;
  searchTerms: string[];
  iconName: string;
  category: BlockCommandCategory;
  shortcut?: string;
  isEnabled?: (editor: Editor) => boolean;
  execute: (editor: Editor) => void;
}
