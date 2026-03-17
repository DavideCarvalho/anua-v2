import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { readJsonLines, toCsv, writeJsonLines } from '../io.mjs'

test('toCsv writes expected header and row', () => {
  const csv = toCsv([
    {
      nome: 'Colegio Exemplo',
      cidade: 'Santos',
      email: 'secretaria@colegioexemplo.com.br',
      telefone: '+55 13 3222-3344',
      site: 'https://www.colegioexemplo.com.br',
      fonte: 'google',
      confidence_score: 85,
    },
  ])

  assert.match(csv, /^nome,cidade,email,telefone,site,fonte,confidence_score/m)
  assert.match(csv, /Colegio Exemplo,Santos,secretaria@colegioexemplo.com.br/)
})

test('readJsonLines restores prior rows written as jsonl', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'coldreach-'))
  const filePath = path.join(tempDir, 'leads.raw.jsonl')
  const rows = [
    { email: 'a@colegio.com.br', site: 'https://colegio.com.br' },
    { email: 'b@colegio.com.br', site: 'https://colegio2.com.br' },
  ]

  await writeJsonLines(filePath, rows)
  const restored = await readJsonLines(filePath)

  assert.deepEqual(restored, rows)
})
