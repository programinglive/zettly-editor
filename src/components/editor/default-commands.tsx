import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Link2,
  Code,
  Undo2,
  Redo2,
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
  {
    id: "undo",
    label: "Undo",
    type: "button",
    run: ({ editor }) => {
      editor.chain().focus().undo().run();
    },
    isEnabled: ({ editor }) => editor.can().chain().focus().undo().run(),
    icon: <Undo2 className="h-4 w-4" />,
    shortcut: "Mod+Z",
  },
  {
    id: "redo",
    label: "Redo",
    type: "button",
    run: ({ editor }) => {
      editor.chain().focus().redo().run();
    },
    isEnabled: ({ editor }) => editor.can().chain().focus().redo().run(),
    icon: <Redo2 className="h-4 w-4" />,
    shortcut: "Mod+Shift+Z",
  },
  {
    id: "heading",
    label: "Heading",
    type: "select",
    options: [
      { value: "paragraph", label: "Paragraph" },
      { value: "heading1", label: "Heading 1" },
      { value: "heading2", label: "Heading 2" },
      { value: "heading3", label: "Heading 3" },
      { value: "heading4", label: "Heading 4" },
      { value: "heading5", label: "Heading 5" },
      { value: "heading6", label: "Heading 6" },
    ],
    placeholder: "Heading",
    getValue: ({ editor }) => {
      for (let level = 1; level <= 6; level += 1) {
        if (editor.isActive("heading", { level })) {
          return `heading${level}`;
        }
      }
      return "paragraph";
    },
    run: ({ editor }, value) => {
      if (!value) {
        return;
      }

      const chain = editor.chain().focus();
      if (value === "paragraph") {
        chain.setParagraph().run();
        return;
      }

      const levelNumber = Number.parseInt(value.replace("heading", ""), 10);
      if (Number.isNaN(levelNumber) || levelNumber < 1 || levelNumber > 6) {
        return;
      }

      chain.setHeading({ level: levelNumber as 1 | 2 | 3 | 4 | 5 | 6 }).run();
    },
  },
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
  toggleCommand(
    "codeBlock",
    "Code Block",
    ({ editor }) => {
      editor.chain().focus().toggleCodeBlock().run();
    },
    ({ editor }) => editor.isActive("codeBlock"),
    <Code className="h-4 w-4" />,
    "Mod+Alt+C"
  ),
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
    isEnabled: ({ permissions }) => permissions.allowLinks === true && !permissions.readOnly,
    icon: <Link2 className="h-4 w-4" />,
  },
];
