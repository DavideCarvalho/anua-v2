import sanitizeHtml from 'sanitize-html'

/**
 * Whitelist mínima do conteúdo gerado pelo Tiptap StarterKit no editor de
 * comunicados. Aceita: p, br, strong/b, em/i, s, u, ul/ol/li, a (href com http/https/mailto).
 * Bloqueia: script, iframe, style, on* handlers, javascript: protocol.
 *
 * Aplicado no save (controllers create/update) e na leitura (defesa em
 * profundidade no render).
 */
export function sanitizeAnnouncementHtml(input: string | null | undefined): string {
  if (!input) return ''
  return sanitizeHtml(input, {
    allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 's', 'u', 'ul', 'ol', 'li', 'a'],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          target: '_blank',
          rel: 'noopener noreferrer nofollow',
        },
      }),
    },
  })
}
