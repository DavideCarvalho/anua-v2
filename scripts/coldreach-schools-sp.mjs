import { parseArgs } from './coldreach/config.mjs'
import crypto from 'node:crypto'
import fs from 'node:fs/promises'

import { runPipeline } from './coldreach/pipeline.mjs'
import { dedupeLeads } from './coldreach/filters.mjs'
import {
  ensureParentDir,
  readJsonLines,
  writeCsv,
  writeJson,
  writeJsonLines,
} from './coldreach/io.mjs'
import { searchDuckduckgo, searchGoogle, searchSerper } from './coldreach/search.mjs'

const DEFAULT_SP_CITIES = [
  'Sao Paulo',
  'Campinas',
  'Sao Bernardo do Campo',
  'Santo Andre',
  'Sao Jose dos Campos',
  'Ribeirao Preto',
  'Sorocaba',
  'Santos',
  'Guaruja',
  'Praia Grande',
  'Sao Vicente',
  'Cubatao',
  'Mongagua',
  'Itanhaem',
  'Peruibe',
  'Bertioga',
  'Caraguatatuba',
  'Taubate',
  'Jundiai',
  'Barueri',
  'Osasco',
  'Maua',
  'Diadema',
  'Cotia',
  'Franca',
  'Bauru',
  'Araraquara',
  'Piracicaba',
  'Limeira',
  'Rio Claro',
  'Americana',
  'Sumare',
  'Indaiatuba',
  'Sao Carlos',
  'Marilia',
  'Presidente Prudente',
  'Aracatuba',
  'Jau',
  'Atibaia',
  'Braganca Paulista',
  'Mogi das Cruzes',
  'Suzano',
  'Itaquaquecetuba',
  'Guarulhos',
  'Itapecerica da Serra',
  'Taboao da Serra',
]

const BAIXADA_SANTISTA = new Set([
  'Santos',
  'Guaruja',
  'Praia Grande',
  'Sao Vicente',
  'Cubatao',
  'Mongagua',
  'Itanhaem',
  'Peruibe',
  'Bertioga',
])

const SEARCH_ENGINES = {
  google: searchGoogle,
  duckduckgo: searchDuckduckgo,
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function normalizeRegionCities(cities, onlyRegion) {
  if (onlyRegion !== 'baixada-santista') {
    return cities
  }

  return cities.filter((city) => BAIXADA_SANTISTA.has(city))
}

async function loadCities(citiesFile) {
  if (!citiesFile) {
    return [...DEFAULT_SP_CITIES]
  }

  const csv = await fs.readFile(citiesFile, 'utf8')
  return csv
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.toLowerCase().startsWith('cidade'))
}

function reportFromLeads(leads, processedCities, totalCities) {
  return {
    generatedAt: new Date().toISOString(),
    totalLeads: leads.length,
    uniqueEmails: new Set(leads.map((lead) => lead.email)).size,
    bySource: leads.reduce((acc, lead) => {
      acc[lead.fonte] = (acc[lead.fonte] || 0) + 1
      return acc
    }, {}),
    processedCities,
    totalCities,
  }
}

function checkpointPath() {
  return 'data/cache/coldreach-checkpoint.json'
}

async function readCheckpoint() {
  try {
    const file = await fs.readFile(checkpointPath(), 'utf8')
    return JSON.parse(file)
  } catch {
    return { processedCities: [] }
  }
}

async function writeCheckpoint(processedCities) {
  await writeJson(checkpointPath(), {
    updatedAt: new Date().toISOString(),
    processedCities,
  })
}

function cachePath(engine, query) {
  const hash = crypto.createHash('sha1').update(`${engine}:${query}`).digest('hex').slice(0, 12)
  return `data/cache/${engine}-${hash}.json`
}

async function searchWithCache({ engine, query, options }) {
  const cachedFile = cachePath(engine, query)

  try {
    const cached = await fs.readFile(cachedFile, 'utf8')
    const parsed = JSON.parse(cached)
    if (Array.isArray(parsed.urls)) {
      if (parsed.urls.length > 0) {
        return parsed.urls.slice(0, options.maxResultsPerQuery)
      }
    }
  } catch {
    // cache miss
  }

  const jitter = Math.floor(Math.random() * options.jitterMs)
  await sleep(options.delayMs + jitter)

  const searchFn = SEARCH_ENGINES[engine]
  let urls = []

  if (options.serperApiKey) {
    urls = await searchSerper(query, {
      apiKey: options.serperApiKey,
      num: options.maxResultsPerQuery,
    })
  } else if (searchFn) {
    urls = await searchFn(query)
  }

  urls = urls.slice(0, options.maxResultsPerQuery)
  await ensureParentDir(cachedFile)
  await fs.writeFile(cachedFile, `${JSON.stringify({ query, engine, urls }, null, 2)}\n`, 'utf8')
  return urls
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  let cities = await loadCities(options.citiesFile)
  cities = normalizeRegionCities(cities, options.onlyRegion)

  const checkpoint = options.resumeFromCache ? await readCheckpoint() : { processedCities: [] }
  const processedSet = new Set(checkpoint.processedCities || [])

  const rawPath = options.output.replace(/\.csv$/i, '.raw.jsonl')
  const reportPath = options.output.replace(/\.csv$/i, '.report.json')
  const allLeads = options.resumeFromCache ? await readJsonLines(rawPath) : []

  for (const city of cities) {
    if (processedSet.has(city)) {
      continue
    }

    process.stdout.write(`Processando cidade: ${city}\n`)

    let citySearchCalls = 0
    let citySearchSuccessCalls = 0
    let cityDiscoveredUrls = 0

    const cityLeads = await runPipeline({
      cities: [city],
      searchEngines: options.engines,
      searchByEngine: async ({ engine, query }) => {
        citySearchCalls += 1
        try {
          const urls = await searchWithCache({ engine, query, options })
          citySearchSuccessCalls += 1
          cityDiscoveredUrls += urls.length
          return urls
        } catch (error) {
          process.stderr.write(
            `[coldreach] search error engine=${engine} city=${city} query=${query}: ${error.message}\n`
          )
          return []
        }
      },
    })

    allLeads.push(...cityLeads)

    if ((citySearchSuccessCalls > 0 && cityDiscoveredUrls > 0) || citySearchCalls === 0) {
      processedSet.add(city)
    } else {
      process.stderr.write(
        `[coldreach] cidade nao marcada como concluida por sem resultados ou falha de busca: ${city}\n`
      )
    }

    const dedupedPartialLeads = dedupeLeads(allLeads)
    await writeCsv(options.output, dedupedPartialLeads)
    await writeJsonLines(rawPath, dedupedPartialLeads)
    await writeJson(
      reportPath,
      reportFromLeads(dedupedPartialLeads, [...processedSet], cities.length)
    )
    await writeCheckpoint([...processedSet])
  }

  const dedupedLeads = dedupeLeads(allLeads)

  await writeCsv(options.output, dedupedLeads)
  await writeJsonLines(rawPath, dedupedLeads)
  await writeJson(reportPath, reportFromLeads(dedupedLeads, [...processedSet], cities.length))

  process.stdout.write(
    `Concluido. Leads: ${dedupedLeads.length}. CSV: ${options.output}. Report: ${reportPath}\n`
  )
}

main().catch((error) => {
  process.stderr.write(`Falha no coldreach: ${error.message}\n`)
  process.exitCode = 1
})
