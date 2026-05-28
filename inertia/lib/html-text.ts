/**
 * Extrai texto plano de HTML pra usar em previews (line-clamp, snippets).
 * Funciona client (DOMParser) e SSR (regex fallback — não precisa de fidelidade
 * perfeita pra preview).
 */
export function htmlToPlainText(html: string | null | undefined): string {
  if (!html) return ''
  if (typeof window !== 'undefined' && typeof window.DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim()
  }
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|li|div|h[1-6])>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}
