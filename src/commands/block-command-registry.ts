import type { Editor } from "@tiptap/core";
import { defaultBlockCommands } from "./default-block-commands";
import type { BlockCommandCategory, BlockCommandItem } from "./types";

export class BlockCommandRegistry {
  private commands = new Map<string, BlockCommandItem>();

  constructor(initialCommands: BlockCommandItem[] = defaultBlockCommands) {
    for (const cmd of initialCommands) {
      this.register(cmd);
    }
  }

  public register(command: BlockCommandItem, overwrite = false): void {
    if (this.commands.has(command.id) && !overwrite) {
      throw new Error(`Command with id "${command.id}" is already registered.`);
    }
    this.commands.set(command.id, command);
  }

  public unregister(id: string): boolean {
    return this.commands.delete(id);
  }

  public get(id: string): BlockCommandItem | undefined {
    return this.commands.get(id);
  }

  public getAll(): BlockCommandItem[] {
    return Array.from(this.commands.values());
  }

  public getByCategory(category: BlockCommandCategory): BlockCommandItem[] {
    return this.getAll().filter((cmd) => cmd.category === category);
  }

  public search(query: string, editor?: Editor): BlockCommandItem[] {
    const trimmed = query.trim().toLowerCase();
    const all = this.getAll();

    const available = editor
      ? all.filter((cmd) => (cmd.isEnabled ? cmd.isEnabled(editor) : true))
      : all;

    if (!trimmed) {
      return available;
    }

    const scored: { item: BlockCommandItem; score: number }[] = [];

    for (const cmd of available) {
      const title = cmd.title.toLowerCase();
      const desc = cmd.description.toLowerCase();
      let score = 0;

      if (title === trimmed) {
        score = 100;
      } else if (title.startsWith(trimmed)) {
        score = 50;
      } else if (title.includes(trimmed)) {
        score = 30;
      }

      for (const term of cmd.searchTerms) {
        const t = term.toLowerCase();
        if (t === trimmed) {
          score = Math.max(score, 40);
        } else if (t.startsWith(trimmed)) {
          score = Math.max(score, 25);
        } else if (t.includes(trimmed)) {
          score = Math.max(score, 15);
        }
      }

      if (score === 0 && desc.includes(trimmed)) {
        score = 5;
      }

      if (score > 0) {
        scored.push({ item: cmd, score });
      }
    }

    // Sort descending by relevance score, preserving relative registration order for equal scores
    scored.sort((a, b) => b.score - a.score);
    return scored.map((s) => s.item);
  }

  public execute(id: string, editor: Editor): boolean {
    const cmd = this.get(id);
    if (!cmd) {
      return false;
    }
    if (cmd.isEnabled && !cmd.isEnabled(editor)) {
      return false;
    }
    cmd.execute(editor);
    return true;
  }
}

export const defaultBlockRegistry = new BlockCommandRegistry();
