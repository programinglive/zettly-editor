import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Link2,
} from "lucide-react";
import { type CommandDefinition, type CommandContext } from "../../types/editor";

const toggleCommand = (
  id: string,
  label: string,
  run: (context: CommandContext) => void,
  isActive?: (context: CommandContext) => boolean,
  icon?: CommandDefinition["icon"],
  shortcut?: string
): CommandDefinition => ({
  id,
  label,
  type: "toggle",
  run,
  icon,
  shortcut,
  isActive,
});

export const defaultCommands: CommandDefinition[] = [
  toggleCommand(
    "bold",
    "Bold",
    ({ editor }) => {
      editor.chain().focus().toggleBold().run();
    },
    ({ editor }) => editor.isActive("bold"),
    <Bold className="h-4 w-4" />,
    "Mod+B"
  ),
  toggleCommand(
    "italic",
    "Italic",
    ({ editor }) => {
      editor.chain().focus().toggleItalic().run();
    },
    ({ editor }) => editor.isActive("italic"),
    <Italic className="h-4 w-4" />,
    "Mod+I"
  ),
  toggleCommand(
    "strike",
    "Strike",
    ({ editor }) => {
      editor.chain().focus().toggleStrike().run();
    },
    ({ editor }) => editor.isActive("strike"),
    <Strikethrough className="h-4 w-4" />,
    "Mod+Shift+X"
  ),
  toggleCommand(
    "bulletList",
    "Bullet List",
    ({ editor }) => {
      editor.chain().focus().toggleBulletList().run();
    },
    ({ editor }) => editor.isActive("bulletList"),
    <List className="h-4 w-4" />
  ),
  toggleCommand(
    "orderedList",
    "Ordered List",
    ({ editor }) => {
      editor.chain().focus().toggleOrderedList().run();
    },
    ({ editor }) => editor.isActive("orderedList"),
    <ListOrdered className="h-4 w-4" />
  ),
  {
    id: "blockquote",
    label: "Blockquote",
    type: "toggle",
    run: ({ editor }) => {
      editor.chain().focus().toggleBlockquote().run();
    },
    isActive: ({ editor }) => editor.isActive("blockquote"),
    icon: <Quote className="h-4 w-4" />,
  },
  {
    id: "link",
    label: "Link",
    type: "button",
    run: ({ editor, permissions }) => {
      if (permissions.readOnly) {
        return;
      }

      const previousUrl = editor.getAttributes("link").href as string | undefined;
      const url = window.prompt("Enter URL", previousUrl ?? "");

      if (url === null) {
        return;
      }

      if (url === "") {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
        return;
      }

      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    },
    isActive: ({ editor }) => editor.isActive("link"),
    icon: <Link2 className="h-4 w-4" />,
  },
];
