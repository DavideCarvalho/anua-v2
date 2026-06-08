import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import { useEffect, useState } from 'react'
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Strikethrough } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from './button'

interface RichTextEditorProps {
  value: string
  onChange: (next: string) => void
  placeholder?: string
  disabled?: boolean
  /** ID applied to the editable area for label `for` association. */
  id?: string
  className?: string
}

function ToolbarButton({
  active,
  onClick,
  disabled,
  label,
  children,
}: {
  active?: boolean
  onClick: () => void
  disabled?: boolean
  label: string
  children: React.ReactNode
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn('h-8 px-2 text-muted-foreground', active && 'bg-muted text-foreground')}
    >
      {children}
    </Button>
  )
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Escreva o comunicado…',
  disabled,
  id,
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Placeholder.configure({ placeholder }),
      Link.configure({
        openOnClick: false,
        autolink: false,
        protocols: ['http', 'https', 'mailto'],
        HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' },
      }),
    ],
    content: value,
    editable: !disabled,
    editorProps: {
      attributes: {
        id: id ?? '',
        class: cn(
          'tiptap-rich-text block min-h-[200px] w-full bg-transparent px-3 py-2.5 text-sm',
          'focus:outline-none disabled:opacity-50',
          'prose prose-sm dark:prose-invert max-w-none',
          '[&_a]:text-primary'
        ),
      },
    },
    onUpdate: ({ editor: e }) => {
      const html = e.getHTML()
      // Tiptap emite "<p></p>" para conteúdo vazio. Tratamos como string vazia
      // pra simplificar required validation no consumer.
      onChange(html === '<p></p>' ? '' : html)
    },
  })

  // Sincroniza valor externo (ex: reset do form, carregar pra edição).
  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    const incoming = value || ''
    if (current === incoming) return
    if (current === '<p></p>' && incoming === '') return
    editor.commands.setContent(incoming, { emitUpdate: false })
  }, [editor, value])

  if (!editor) {
    return (
      <div
        className={cn(
          'min-h-[200px] rounded-lg border border-input bg-transparent px-3 py-2.5 text-sm text-muted-foreground',
          className
        )}
      >
        Carregando editor…
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-input focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50',
        className
      )}
    >
      <Toolbar editor={editor} disabled={disabled} />
      <EditorContent editor={editor} />
    </div>
  )
}

function Toolbar({ editor, disabled }: { editor: Editor; disabled?: boolean }) {
  const [, force] = useState(0)
  useEffect(() => {
    const handler = () => force((n) => n + 1)
    editor.on('selectionUpdate', handler)
    editor.on('transaction', handler)
    return () => {
      editor.off('selectionUpdate', handler)
      editor.off('transaction', handler)
    }
  }, [editor])

  const promptLink = () => {
    const previousUrl = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('URL do link', previousUrl ?? 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetMark('link').run()
      return
    }
    try {
      const parsed = new URL(url)
      if (!['http:', 'https:', 'mailto:'].includes(parsed.protocol)) return
    } catch {
      return
    }
    editor.chain().focus().extendMarkRange('link').setMark('link', { href: url }).run()
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-input px-1.5 py-1">
      <ToolbarButton
        label="Negrito"
        active={editor.isActive('bold')}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        label="Itálico"
        active={editor.isActive('italic')}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        label="Tachado"
        active={editor.isActive('strike')}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="h-3.5 w-3.5" />
      </ToolbarButton>
      <div className="mx-1 h-5 w-px bg-border" />
      <ToolbarButton
        label="Lista com marcadores"
        active={editor.isActive('bulletList')}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        label="Lista numerada"
        active={editor.isActive('orderedList')}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-3.5 w-3.5" />
      </ToolbarButton>
      <div className="mx-1 h-5 w-px bg-border" />
      <ToolbarButton
        label="Link"
        active={editor.isActive('link')}
        disabled={disabled}
        onClick={promptLink}
      >
        <LinkIcon className="h-3.5 w-3.5" />
      </ToolbarButton>
    </div>
  )
}
