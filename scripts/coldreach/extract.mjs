const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
const PHONE_PATTERN = /(?:\+55\s?)?(?:\(?\d{2}\)?\s?)?(?:9\d{4}|\d{4})[-\s]?\d{4}/g

export function extractContacts(html) {
  const emailMatches = html.match(EMAIL_PATTERN) || []
  const phoneMatches = html.match(PHONE_PATTERN) || []

  const emails = [...new Set(emailMatches.map((value) => value.toLowerCase()))].sort()
  const phones = [...new Set(phoneMatches)]

  return { emails, phones }
}
