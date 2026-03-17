import { extractContacts } from './extract.mjs'

const CONTACT_PATHS = ['/', '/contato', '/fale-conosco', '/institucional']

function sanitizeName(rawName = '') {
  return rawName.replace(/\s+/g, ' ').replace(/\|.*/g, '').trim()
}

function extractNameFromHtml(html) {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (titleMatch?.[1]) {
    return sanitizeName(titleMatch[1])
  }

  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
  if (h1Match?.[1]) {
    return sanitizeName(h1Match[1])
  }

  return ''
}

async function fetchPage(url, fetchImpl) {
  const response = await fetchImpl(url, {
    headers: {
      'user-agent':
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    },
  })

  if (!response.ok) {
    return ''
  }

  return response.text()
}

export async function crawlSite({ site, city }, fetchImpl = fetch) {
  const baseUrl = new URL(site)
  const emailSet = new Set()
  const phoneSet = new Set()
  let sourcePage = 'home'
  let name = ''

  for (const pagePath of CONTACT_PATHS) {
    const targetUrl = new URL(pagePath, baseUrl).toString()
    const html = await fetchPage(targetUrl, fetchImpl)
    if (!html) {
      continue
    }

    if (!name) {
      name = extractNameFromHtml(html)
    }

    const contacts = extractContacts(html)
    for (const email of contacts.emails) emailSet.add(email)
    for (const phone of contacts.phones) phoneSet.add(phone)

    if (contacts.emails.length > 0 && pagePath !== '/') {
      sourcePage = 'contact'
    }
  }

  return {
    nome: name,
    cidade: city,
    site: baseUrl.toString(),
    emails: [...emailSet],
    phones: [...phoneSet],
    sourcePage,
  }
}
