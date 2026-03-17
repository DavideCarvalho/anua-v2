import { dedupeLeads, isInstitutionalEmail, shouldKeepLead, shouldSkipSiteUrl } from './filters.mjs'
import { scoreLead } from './score.mjs'
import { crawlSite as defaultCrawlSite } from './crawler.mjs'
import { searchDuckduckgo, searchGoogle } from './search.mjs'

const SEARCH_BY_ENGINE = {
  google: searchGoogle,
  duckduckgo: searchDuckduckgo,
}

async function defaultSearchByEngine({ engine, query }) {
  const searchFn = SEARCH_BY_ENGINE[engine]
  if (!searchFn) {
    return []
  }

  return searchFn(query)
}

function buildQueriesForCity(city) {
  return [
    `escola particular ${city} sp`,
    `colegio particular ${city} sp`,
    `colegio ${city} contato`,
    `escola infantil ${city} contato`,
  ]
}

export async function runPipeline({
  cities,
  searchEngines,
  searchByEngine = defaultSearchByEngine,
  crawlSite = defaultCrawlSite,
}) {
  const allLeads = []

  for (const city of cities) {
    const queries = buildQueriesForCity(city)

    for (const engine of searchEngines) {
      const cityUrls = new Set()

      for (const query of queries) {
        let urls = []
        try {
          urls = await searchByEngine({ engine, query, city })
        } catch (error) {
          process.stderr.write(
            `[coldreach] search error engine=${engine} city=${city} query=${query}: ${error.message}\n`
          )
          continue
        }

        for (const site of urls) {
          cityUrls.add(site)
        }
      }

      for (const site of cityUrls) {
        if (shouldSkipSiteUrl(site)) {
          continue
        }

        let crawlResult
        try {
          crawlResult = await crawlSite({ site, city, engine })
        } catch (error) {
          process.stderr.write(
            `[coldreach] crawl error engine=${engine} city=${city} site=${site}: ${error.message}\n`
          )
          continue
        }

        for (const email of crawlResult.emails || []) {
          if (!isInstitutionalEmail(email)) {
            continue
          }

          if (
            !shouldKeepLead({
              nome: crawlResult.nome || '',
              site: crawlResult.site || site,
              email,
            })
          ) {
            continue
          }

          allLeads.push({
            nome: crawlResult.nome || '',
            cidade: crawlResult.cidade || city,
            email: email.toLowerCase(),
            telefone: (crawlResult.phones || [])[0] || '',
            site: crawlResult.site || site,
            fonte: engine,
            confidence_score: scoreLead({
              email,
              site: crawlResult.site || site,
              sourcePage: crawlResult.sourcePage,
            }),
          })
        }
      }
    }
  }

  return dedupeLeads(allLeads)
}
