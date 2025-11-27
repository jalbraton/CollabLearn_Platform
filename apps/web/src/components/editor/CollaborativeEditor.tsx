"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Typography from "@tiptap/extension-typography"
import Highlight from "@tiptap/extension-highlight"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import { Color } from "@tiptap/extension-color"
import TextStyle from "@tiptap/extension-text-style"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import Table from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableHeader from "@tiptap/extension-table-header"
import TableCell from "@tiptap/extension-table-cell"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import { common, createLowlight } from "lowlight"
import { EditorToolbar } from "./EditorToolbar"
import "./editor-styles.css"

const lowlight = createLowlight(common)

interface CollaborativeEditorProps {
  content?: string
  onChange?: (content: string) => void
  editable?: boolean
  placeholder?: string
}

export function CollaborativeEditor({
  content = "",
  onChange,
  editable = true,
  placeholder = "Start writing...",
}: CollaborativeEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
      Typography,
      Highlight.configure({
        multicolor: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 hover:text-blue-800 underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: "rounded-lg",
        },
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert max-w-none focus:outline-none min-h-[500px] p-4",
      },
    },
  })

  return (
    <div className="border rounded-lg bg-white dark:bg-gray-800 overflow-hidden">
      {editable && editor && <EditorToolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  )
}
