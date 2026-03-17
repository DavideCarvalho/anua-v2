import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

import {
  parseDuckduckgoSerp,
  parseGoogleSerp,
  searchDuckduckgo,
  searchGoogle,
  searchSerper,
} from '../search.mjs'

test('parseGoogleSerp extracts valid result urls', async () => {
  const html = await fs.readFile(new URL('./fixtures/google-serp.html', import.meta.url), 'utf8')
  const urls = parseGoogleSerp(html)

  assert.deepEqual(urls, [
    'https://www.colegioporto.com.br/contato',
    'https://www.colegioexemplo.com.br',
    'https://www.escolaabc.com.br',
  ])
})

test('parseDuckduckgoSerp extracts valid result urls', async () => {
  const html = await fs.readFile(
    new URL('./fixtures/duckduckgo-serp.html', import.meta.url),
    'utf8'
  )
  const urls = parseDuckduckgoSerp(html)

  assert.deepEqual(urls, [
    'https://www.escolaexemplo.com.br',
    'https://www.colegioxyz.com.br',
    'https://escolas.com.br/particulares/sp/santos',
  ])
})

test('searchGoogle uses fetch and parser', async () => {
  const fakeFetch = async () => ({
    ok: true,
    text: async () => '<a href="https://www.colegioexemplo.com.br">x</a>',
  })

  const urls = await searchGoogle('escola particular santos sp', fakeFetch)
  assert.deepEqual(urls, ['https://www.colegioexemplo.com.br'])
})

test('searchDuckduckgo uses fetch and parser', async () => {
  const fakeFetch = async () => ({
    ok: true,
    text: async () => '<a class="result__a" href="https://www.escolaexemplo.com.br">x</a>',
  })

  const urls = await searchDuckduckgo('colegio particular santos sp', fakeFetch)
  assert.deepEqual(urls, ['https://www.escolaexemplo.com.br'])
})

test('searchSerper parses organic links from API response', async () => {
  const fakeFetch = async () => ({
    ok: true,
    json: async () => ({
      organic: [
        { link: 'https://www.colegioexemplo.com.br' },
        { link: 'https://www.colegioxyz.com.br' },
      ],
    }),
  })

  const urls = await searchSerper('colegio santos contato', {
    apiKey: 'test-key-123',
    fetchImpl: fakeFetch,
  })

  assert.deepEqual(urls, ['https://www.colegioexemplo.com.br', 'https://www.colegioxyz.com.br'])
})

test('searchSerper throws when api key missing', async () => {
  await assert.rejects(
    () => searchSerper('colegio santos contato', {}),
    /Serper API key is required/
  )
})
