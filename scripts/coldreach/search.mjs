function unique(values) {
  return [...new Set(values)]
}

function normalizeRawUrl(rawUrl) {
  if (!rawUrl) {
    return ''
  }

  if (rawUrl.startsWith('//')) {
    return `https:${rawUrl}`
  }

  return rawUrl
}

function decodeGoogleRedirect(url) {
  if (!url.startsWith('/url?')) {
    return url
  }

  const params = new URLSearchParams(url.slice('/url?'.length))
  return params.get('q') || ''
}

function decodeDuckduckgoRedirect(url) {
  if (!url.includes('duckduckgo.com/l/?')) {
    return url
  }

  const parsed = new URL(url)
  return parsed.searchParams.get('uddg') || ''
}

function toExternalUrl(rawUrl) {
  const normalized = normalizeRawUrl(rawUrl)
  const googleDecoded = decodeGoogleRedirect(normalized)
  const duckDecoded = decodeDuckduckgoRedirect(googleDecoded)

  if (duckDecoded.startsWith('http://') || duckDecoded.startsWith('https://')) {
    return duckDecoded
  }

  return ''
}

export function parseGoogleSerp(html) {
  const urls = [...html.matchAll(/<a\s+href="([^"]+)"/g)]
    .map((match) => toExternalUrl(match[1]))
    .filter(Boolean)
    .filter((url) => !url.includes('google.com'))

  return unique(urls)
}

export function parseDuckduckgoSerp(html) {
  const urls = [...html.matchAll(/class="result__a"[^>]*href="([^"]+)"/g)]
    .map((match) => toExternalUrl(match[1]))
    .filter(Boolean)
    .filter((url) => !url.includes('duckduckgo.com/'))

  return unique(urls)
}

async function fetchText(url, fetchImpl) {
  const response = await fetchImpl(url, {
    headers: {
      'user-agent':
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    },
  })

  if (!response.ok) {
    throw new Error(`Search request failed: ${response.status}`)
  }

  return response.text()
}

export async function searchGoogle(query, fetchImpl = fetch) {
  const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`
  const html = await fetchText(url, fetchImpl)
  return parseGoogleSerp(html)
}

export async function searchDuckduckgo(query, fetchImpl = fetch) {
  const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`
  const html = await fetchText(url, fetchImpl)
  return parseDuckduckgoSerp(html)
}

export async function searchSerper(
  query,
  { apiKey, fetchImpl = fetch, gl = 'br', hl = 'pt-br', num = 20 } = {}
) {
  if (!apiKey) {
    throw new Error('Serper API key is required')
  }

  const response = await fetchImpl('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ q: query, gl, hl, num }),
  })

  if (!response.ok) {
    throw new Error(`Serper request failed: ${response.status}`)
  }

  const payload = await response.json()
  const urls = (payload.organic || [])
    .map((entry) => entry?.link)
    .filter((value) => typeof value === 'string')
    .filter((url) => url.startsWith('http://') || url.startsWith('https://'))

  return unique(urls)
}
