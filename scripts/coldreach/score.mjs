function normalizeHost(site) {
  if (!site) return ''
  const hostname = new URL(site).hostname.toLowerCase()
  return hostname.replace(/^www\./, '')
}

export function scoreLead({ email, site, sourcePage }) {
  let score = 0

  const localPart = String(email || '').split('@')[0] || ''
  const domain = String(email || '').split('@')[1] || ''
  const siteHost = normalizeHost(site)

  if (domain && domain === siteHost) {
    score += 40
  }

  if (sourcePage === 'contact') {
    score += 25
  }

  if (
    /contato|secretaria|atendimento|comercial|diretoria|adm|coordenacao|pedagogico/.test(localPart)
  ) {
    score += 20
  }

  return score
}
