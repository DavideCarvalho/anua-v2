import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

import { extractContacts } from '../extract.mjs'

test('extractContacts reads emails and phones from html', async () => {
  const fixturePath = new URL('./fixtures/school-contact.html', import.meta.url)
  const html = await fs.readFile(fixturePath, 'utf8')

  const contacts = extractContacts(html)

  assert.deepEqual(contacts.emails, [
    'contato@colegioexemplo.com.br',
    'secretaria@colegioexemplo.com.br',
  ])
  assert.deepEqual(contacts.phones, ['+55 13 3222-3344'])
})
