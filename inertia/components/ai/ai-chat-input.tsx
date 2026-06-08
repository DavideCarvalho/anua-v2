import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Extension } from '@tiptap/core'
import { useEffect } from 'react'
import { cn } from '../../lib/utils'

type AiChatInputProps = {
  value: string
  disabled?: boolean
  placeholder?: string
  onChange: (next: string) => void
  onSubmit: () => void | Promise<void>
  autoFocusKey?: unknown
}

function makeSubmitExtension(onSubmit: () => void | Promise<void>) {
  return Extension.create({
    name: 'submitOnEnter',
    addKeyboardShortcuts() {
      return {
        'Enter': () => {
          void onSubmit()
          return true
        },
        'Shift-Enter': () => {
          return this.editor.commands.insertContent('\n')
        },
      }
    },
  })
}

function editorTextValue(editor: Editor | null): string {
  if (!editor) return ''
  return editor.getText().replace(/\n+$/, '')
}

export function AiChatInput({
  value,
  disabled,
  placeholder = 'Pergunte sobre alunos, turmas, financeiro…',
  onChange,
  onSubmit,
  autoFocusKey,
}: AiChatInputProps) {
  const editor = useEditor({
    // Inertia SSRs the initial page; Tiptap can't run on the server because
    // its DOM-based editor needs window. immediatelyRender:false defers the
    // editor construction to the client mount.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        bulletList: false,
        orderedList: false,
        horizontalRule: false,
      }),
      Placeholder.configure({ placeholder }),
      makeSubmitExtension(onSubmit),
    ],
    content: value,
    editable: !disabled,
    editorProps: {
      attributes: {
        class: cn(
          'tiptap-input block w-full resize-none rounded-lg bg-transparent px-3.5 py-2.5 text-sm',
          'focus:outline-none disabled:opacity-50 min-h-[40px] max-h-[160px] overflow-y-auto',
          'prose prose-sm dark:prose-invert max-w-none'
        ),
      },
    },
    onUpdate: ({ editor: e }) => {
      onChange(editorTextValue(e))
    },
  })

  useEffect(() => {
    if (!editor) return
    if (value !== editorTextValue(editor)) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [value, editor])

  useEffect(() => {
    if (!editor) return
    editor.setEditable(!disabled)
  }, [disabled, editor])

  useEffect(() => {
    if (!editor || disabled) return
    editor.commands.focus('end')
  }, [autoFocusKey, editor, disabled])

  return (
    <div
      className={cn(
        'flex-1 rounded-lg border border-input bg-background transition-colors',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1',
        disabled && 'opacity-60'
      )}
    >
      <EditorContent editor={editor} />
    </div>
  )
}
