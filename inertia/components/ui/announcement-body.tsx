import { cn } from '../../lib/utils'

interface AnnouncementBodyProps {
  /** HTML já sanitizado no backend (`sanitizeAnnouncementHtml`). */
  html: string | null | undefined
  className?: string
}

/**
 * Renderiza o corpo de um comunicado escolar. O HTML é produzido pelo Tiptap
 * (RichTextEditor) e sanitizado no backend pelo `sanitize_announcement_html`,
 * que libera apenas `<p><br><strong><em><s><u><ul><ol><li><a>`. Aqui usamos
 * `dangerouslySetInnerHTML` confiando nessa sanitização — não renderizamos
 * HTML que veio direto do usuário sem passar pelo backend.
 */
export function AnnouncementBody({ html, className }: AnnouncementBodyProps) {
  const safe = html ?? ''
  if (!safe) {
    return null
  }
  return (
    <div
      className={cn(
        'prose prose-sm dark:prose-invert max-w-none text-foreground',
        '[&_a]:text-primary [&_a]:underline',
        className
      )}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  )
}
