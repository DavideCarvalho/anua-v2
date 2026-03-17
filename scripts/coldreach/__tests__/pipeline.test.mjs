import test from 'node:test'
import assert from 'node:assert/strict'

import { runPipeline } from '../pipeline.mjs'
import { scoreLead } from '../score.mjs'

test('scoreLead gives higher score for same-domain institutional contact page email', () => {
  const score = scoreLead({
    email: 'secretaria@colegioexemplo.com.br',
    site: 'https://colegioexemplo.com.br',
    sourcePage: 'contact',
  })

  assert.equal(score, 85)
})

test('runPipeline returns deduped institutional leads', async () => {
  const result = await runPipeline({
    cities: ['Santos'],
    searchEngines: ['google'],
    searchByEngine: async () => ['https://www.colegioexemplo.com.br'],
    crawlSite: async () => ({
      nome: 'Colegio Exemplo',
      cidade: 'Santos',
      site: 'https://www.colegioexemplo.com.br',
      emails: ['secretaria@colegioexemplo.com.br', 'escola@gmail.com'],
      phones: ['+55 13 3222-3344'],
      sourcePage: 'contact',
    }),
  })

  assert.equal(result.length, 1)
  assert.equal(result[0].email, 'secretaria@colegioexemplo.com.br')
  assert.equal(result[0].confidence_score, 85)
  assert.equal(result[0].fonte, 'google')
})

test('runPipeline drops aggregator and public-school looking leads', async () => {
  const result = await runPipeline({
    cities: ['Santos'],
    searchEngines: ['duckduckgo'],
    searchByEngine: async () => [
      'https://www.melhorescola.com.br/escola/por-mensalidade/sao-paulo/santos',
      'https://www.colegio-santos.com.br',
      'https://www.escolaestadual-santos.sp.gov.br',
    ],
    crawlSite: async ({ site }) => {
      if (site.includes('melhorescola')) {
        return {
          nome: 'Encontre a Melhor Escola e Bolsas de Estudo Para Seu Filho',
          cidade: 'Santos',
          site,
          emails: ['imprensa@melhorescola.com.br'],
          phones: ['0490-0491'],
          sourcePage: 'contact',
        }
      }

      if (site.includes('escolaestadual')) {
        return {
          nome: 'Escola Estadual Santos',
          cidade: 'Santos',
          site,
          emails: ['secretaria@escolaestadual-santos.sp.gov.br'],
          phones: ['+55 13 3211-2222'],
          sourcePage: 'contact',
        }
      }

      return {
        nome: 'Colegio Santos',
        cidade: 'Santos',
        site,
        emails: ['contato@colegio-santos.com.br'],
        phones: ['+55 13 3333-4444'],
        sourcePage: 'contact',
      }
    },
  })

  assert.equal(result.length, 1)
  assert.equal(result[0].site, 'https://www.colegio-santos.com.br')
  assert.equal(result[0].email, 'contato@colegio-santos.com.br')
})

test('runPipeline continues when one query fails', async () => {
  let calls = 0
  const result = await runPipeline({
    cities: ['Santos'],
    searchEngines: ['duckduckgo'],
    searchByEngine: async () => {
      calls += 1
      if (calls === 1) {
        throw new Error('Search request failed: 403')
      }

      return ['https://www.colegio-santos.com.br']
    },
    crawlSite: async ({ site }) => ({
      nome: 'Colegio Santos',
      cidade: 'Santos',
      site,
      emails: ['contato@colegio-santos.com.br'],
      phones: [],
      sourcePage: 'contact',
    }),
  })

  assert.equal(result.length, 1)
  assert.equal(result[0].email, 'contato@colegio-santos.com.br')
})
