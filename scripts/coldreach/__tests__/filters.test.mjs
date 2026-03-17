import test from 'node:test'
import assert from 'node:assert/strict'

import {
  dedupeLeads,
  isInstitutionalEmail,
  shouldKeepLead,
  shouldSkipSiteUrl,
} from '../filters.mjs'

test('isInstitutionalEmail accepts institutional domains', () => {
  assert.equal(isInstitutionalEmail('secretaria@colegio-exemplo.com.br'), true)
  assert.equal(isInstitutionalEmail('contato@escolaabc.edu.br'), true)
})

test('isInstitutionalEmail rejects personal providers', () => {
  assert.equal(isInstitutionalEmail('contato.escola@gmail.com'), false)
  assert.equal(isInstitutionalEmail('matriculas@hotmail.com'), false)
})

test('dedupeLeads keeps richer record per email', () => {
  const leads = [
    {
      nome: '',
      cidade: 'Santos',
      email: 'contato@colegioa.com.br',
      telefone: '',
      site: 'https://colegioa.com.br',
      fonte: 'google',
    },
    {
      nome: 'Colegio A',
      cidade: 'Santos',
      email: 'contato@colegioa.com.br',
      telefone: '+55 13 3222-3344',
      site: 'https://colegioa.com.br',
      fonte: 'duckduckgo',
    },
  ]

  const output = dedupeLeads(leads)
  assert.equal(output.length, 1)
  assert.equal(output[0].nome, 'Colegio A')
  assert.equal(output[0].telefone, '+55 13 3222-3344')
})

test('shouldSkipSiteUrl blocks known aggregator domains', () => {
  assert.equal(
    shouldSkipSiteUrl('https://www.melhorescola.com.br/escola/por-mensalidade/sao-paulo/santos'),
    true
  )
  assert.equal(shouldSkipSiteUrl('https://www.colegio-santos.com.br'), false)
})

test('shouldKeepLead blocks aggregator email and public school', () => {
  assert.equal(
    shouldKeepLead({
      nome: 'Melhor Escola - Ranking',
      site: 'https://www.melhorescola.com.br',
      email: 'imprensa@melhorescola.com.br',
    }),
    false
  )

  assert.equal(
    shouldKeepLead({
      nome: 'Escola Estadual Santos',
      site: 'https://www.escolaestadual-santos.sp.gov.br',
      email: 'secretaria@escolaestadual-santos.sp.gov.br',
    }),
    false
  )

  assert.equal(
    shouldKeepLead({
      nome: 'Colegio Santos',
      site: 'https://www.colegio-santos.com.br',
      email: 'contato@colegio-santos.com.br',
    }),
    true
  )

  assert.equal(
    shouldKeepLead({
      nome: 'Colegio Santos',
      site: 'https://www.colegio-santos.com.br',
      email: 'joao@colegio-santos.com.br',
    }),
    false
  )
})
