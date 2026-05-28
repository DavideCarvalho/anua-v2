import sanitizeHtml from 'sanitize-html'

import { cn } from '../../lib/utils'

interface NotificationMessageProps {
  message: string
  className?: string
}

const ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 's', 'u', 'ul', 'ol', 'li', 'a', 'span']

/**
 * Renderiza o body de uma notification (in-app). Notificações de comunicados vêm
 * com HTML do RichTextEditor (Tiptap); outras notifications são texto puro.
 * Sanitizamos sempre — defesa em profundidade contra XSS caso algum dispatcher
 * futuro injete HTML não-confiável em `message`.
 */
export function NotificationMessage({ message, className }: NotificationMessageProps) {
  if (!message) return null

  const safe = sanitizeHtml(message, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: { a: ['href', 'rel', 'target'] },
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer', target: '_blank' }),
    },
  })

  return (
    <div
      className={cn('prose prose-sm max-w-none [&_p]:m-0 [&_a]:text-primary', className)}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  )
}
