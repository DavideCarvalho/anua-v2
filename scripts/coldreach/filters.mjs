const PERSONAL_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'hotmail.com',
  'outlook.com',
  'yahoo.com',
  'icloud.com',
  'live.com',
  'uol.com.br',
  'bol.com.br',
])

const BLOCKED_DOMAIN_SUFFIXES = [
  'melhorescola.com.br',
  'escolas.com.br',
  'escolas.inf.br',
  'guiadasescolas.com.br',
  'queroescola.com.br',
  'hpg.com.br',
  'schooladvisor.com.br',
  'listamais.com.br',
  'cylex.com.br',
  'ueniweb.com',
  'facebook.com',
  'instagram.com',
  'linkedin.com',
  'youtube.com',
  'tiktok.com',
  'sp.gov.br',
]

const SCHOOL_NAME_HINTS = [
  'escola',
  'colegio',
  'colégio',
  'educacao',
  'educação',
  'ensino',
  'instituto',
]

const PUBLIC_SCHOOL_HINTS = [
  'escola estadual',
  'municipal',
  'emef',
  'e.e.',
  '.sp.gov.br',
  'prefeitura',
]

const INSTITUTIONAL_LOCAL_PART_HINTS = [
  'contato',
  'secretaria',
  'atendimento',
  'comercial',
  'diretoria',
  'adm',
  'coordenacao',
  'pedagogico',
  'financeiro',
  'matriculas',
  'relacionamento',
  'faleconosco',
]

function scoreLeadCompleteness(lead) {
  let score = 0
  if (lead.nome) score += 2
  if (lead.cidade) score += 1
  if (lead.telefone) score += 1
  if (lead.site) score += 1
  return score
}

export function isInstitutionalEmail(email) {
  const normalized = String(email || '')
    .trim()
    .toLowerCase()
  if (!normalized.includes('@')) {
    return false
  }

  const parts = normalized.split('@')
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return false
  }

  return !PERSONAL_EMAIL_DOMAINS.has(parts[1])
}

function normalizeHost(url) {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return ''
  }
}

function domainMatchesSuffix(domain, suffixes) {
  return suffixes.some((suffix) => domain === suffix || domain.endsWith(`.${suffix}`))
}

function hasSchoolHint(text) {
  const normalized = String(text || '').toLowerCase()
  return SCHOOL_NAME_HINTS.some((hint) => normalized.includes(hint))
}

function hasPublicSchoolHint(text) {
  const normalized = String(text || '').toLowerCase()
  return PUBLIC_SCHOOL_HINTS.some((hint) => normalized.includes(hint))
}

function isSameSchoolDomain(emailDomain, siteHost) {
  if (!emailDomain || !siteHost) return false
  return (
    emailDomain === siteHost ||
    emailDomain.endsWith(`.${siteHost}`) ||
    siteHost.endsWith(`.${emailDomain}`)
  )
}

export function shouldSkipSiteUrl(siteUrl) {
  const host = normalizeHost(siteUrl)
  if (!host) {
    return true
  }

  return domainMatchesSuffix(host, BLOCKED_DOMAIN_SUFFIXES)
}

export function shouldKeepLead({ nome, site, email }) {
  const host = normalizeHost(site)
  const emailDomain =
    String(email || '')
      .split('@')[1]
      ?.toLowerCase() || ''

  if (!host || !emailDomain) {
    return false
  }

  if (domainMatchesSuffix(host, BLOCKED_DOMAIN_SUFFIXES)) {
    return false
  }

  if (domainMatchesSuffix(emailDomain, BLOCKED_DOMAIN_SUFFIXES)) {
    return false
  }

  const textSignals = `${nome || ''} ${host}`

  if (!hasSchoolHint(textSignals)) {
    return false
  }

  if (hasPublicSchoolHint(textSignals)) {
    return false
  }

  if (!isSameSchoolDomain(emailDomain, host)) {
    return false
  }

  const localPart =
    String(email || '')
      .split('@')[0]
      ?.toLowerCase() || ''
  if (!INSTITUTIONAL_LOCAL_PART_HINTS.some((hint) => localPart.includes(hint))) {
    return false
  }

  return true
}

export function dedupeLeads(leads) {
  const grouped = new Map()

  for (const lead of leads) {
    const email = String(lead.email || '')
      .trim()
      .toLowerCase()
    if (!email) continue

    const current = grouped.get(email)
    if (!current || scoreLeadCompleteness(lead) > scoreLeadCompleteness(current)) {
      grouped.set(email, { ...lead, email })
    }
  }

  return [...grouped.values()]
}
