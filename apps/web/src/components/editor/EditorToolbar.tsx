"use client"

import { Editor } from "@tiptap/react"
import { Button } from "@/components/ui/button"
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Highlighter,
  CheckSquare,
  Code2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react"

interface EditorToolbarProps {
  editor: Editor
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const addLink = () => {
    const url = window.prompt("Enter URL:")
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const addImage = () => {
    const url = window.prompt("Enter image URL:")
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  const buttons = [
    // Text Formatting
    {
      icon: Bold,
      onClick: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive("bold"),
      title: "Bold",
    },
    {
      icon: Italic,
      onClick: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive("italic"),
      title: "Italic",
    },
    {
      icon: Strikethrough,
      onClick: () => editor.chain().focus().toggleStrike().run(),
      active: editor.isActive("strike"),
      title: "Strikethrough",
    },
    {
      icon: Code,
      onClick: () => editor.chain().focus().toggleCode().run(),
      active: editor.isActive("code"),
      title: "Inline Code",
    },
    {
      icon: Highlighter,
      onClick: () => editor.chain().focus().toggleHighlight().run(),
      active: editor.isActive("highlight"),
      title: "Highlight",
    },

    // Headings
    {
      icon: Heading1,
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      active: editor.isActive("heading", { level: 1 }),
      title: "Heading 1",
    },
    {
      icon: Heading2,
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor.isActive("heading", { level: 2 }),
      title: "Heading 2",
    },
    {
      icon: Heading3,
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      active: editor.isActive("heading", { level: 3 }),
      title: "Heading 3",
    },

    // Lists
    {
      icon: List,
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive("bulletList"),
      title: "Bullet List",
    },
    {
      icon: ListOrdered,
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive("orderedList"),
      title: "Ordered List",
    },
    {
      icon: CheckSquare,
      onClick: () => editor.chain().focus().toggleTaskList().run(),
      active: editor.isActive("taskList"),
      title: "Task List",
    },

    // Blocks
    {
      icon: Quote,
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
      active: editor.isActive("blockquote"),
      title: "Blockquote",
    },
    {
      icon: Code2,
      onClick: () => editor.chain().focus().toggleCodeBlock().run(),
      active: editor.isActive("codeBlock"),
      title: "Code Block",
    },

    // Insert
    {
      icon: LinkIcon,
      onClick: addLink,
      active: editor.isActive("link"),
      title: "Add Link",
    },
    {
      icon: ImageIcon,
      onClick: addImage,
      active: false,
      title: "Add Image",
    },
    {
      icon: TableIcon,
      onClick: addTable,
      active: editor.isActive("table"),
      title: "Insert Table",
    },

    // History
    {
      icon: Undo,
      onClick: () => editor.chain().focus().undo().run(),
      active: false,
      title: "Undo",
      disabled: !editor.can().undo(),
    },
    {
      icon: Redo,
      onClick: () => editor.chain().focus().redo().run(),
      active: false,
      title: "Redo",
      disabled: !editor.can().redo(),
    },
  ]

  return (
    <div className="border-b bg-gray-50 dark:bg-gray-900 p-2 flex flex-wrap gap-1">
      {buttons.map((button, index) => (
        <button
          key={index}
          onClick={button.onClick}
          disabled={button.disabled}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
            button.active ? "bg-gray-300 dark:bg-gray-600" : ""
          } ${button.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          title={button.title}
        >
          <button.icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  )
}
