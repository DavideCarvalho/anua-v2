import test from 'node:test'
import assert from 'node:assert/strict'

import { parseArgs } from '../config.mjs'

test('parseArgs returns default options', () => {
  const options = parseArgs([])

  assert.deepEqual(options.engines, ['google', 'duckduckgo'])
  assert.equal(options.output, 'data/leads/escolas-sp.csv')
  assert.equal(options.delayMs, 1200)
  assert.equal(options.jitterMs, 500)
  assert.equal(options.maxResultsPerQuery, 20)
  assert.equal(options.resumeFromCache, false)
})

test('parseArgs reads common flags', () => {
  const options = parseArgs([
    '--engine=duckduckgo',
    '--output=data/leads/custom.csv',
    '--delay-ms=2000',
    '--jitter-ms=200',
    '--max-results-per-query=7',
    '--resume-from-cache',
    '--cities-file=data/reference/sp-cities.csv',
    '--only-region=baixada-santista',
    '--serper-api-key=test-key-123',
  ])

  assert.deepEqual(options.engines, ['duckduckgo'])
  assert.equal(options.output, 'data/leads/custom.csv')
  assert.equal(options.delayMs, 2000)
  assert.equal(options.jitterMs, 200)
  assert.equal(options.maxResultsPerQuery, 7)
  assert.equal(options.resumeFromCache, true)
  assert.equal(options.citiesFile, 'data/reference/sp-cities.csv')
  assert.equal(options.onlyRegion, 'baixada-santista')
  assert.equal(options.serperApiKey, 'test-key-123')
})
