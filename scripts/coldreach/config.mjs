const DEFAULT_OPTIONS = {
  engines: ['google', 'duckduckgo'],
  output: 'data/leads/escolas-sp.csv',
  delayMs: 1200,
  jitterMs: 500,
  maxResultsPerQuery: 20,
  resumeFromCache: false,
  citiesFile: undefined,
  onlyRegion: undefined,
  serperApiKey: undefined,
}

function parseNumber(rawValue, fallback) {
  const parsed = Number.parseInt(rawValue, 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

export function parseArgs(argv) {
  const options = { ...DEFAULT_OPTIONS }

  for (const arg of argv) {
    if (arg === '--resume-from-cache') {
      options.resumeFromCache = true
      continue
    }

    if (!arg.startsWith('--')) {
      continue
    }

    const [flag, value = ''] = arg.split('=')

    switch (flag) {
      case '--engine':
        options.engines = value
          .split(',')
          .map((entry) => entry.trim())
          .filter(Boolean)
        break
      case '--output':
        options.output = value || DEFAULT_OPTIONS.output
        break
      case '--delay-ms':
        options.delayMs = parseNumber(value, DEFAULT_OPTIONS.delayMs)
        break
      case '--jitter-ms':
        options.jitterMs = parseNumber(value, DEFAULT_OPTIONS.jitterMs)
        break
      case '--max-results-per-query':
        options.maxResultsPerQuery = parseNumber(value, DEFAULT_OPTIONS.maxResultsPerQuery)
        break
      case '--cities-file':
        options.citiesFile = value || undefined
        break
      case '--only-region':
        options.onlyRegion = value || undefined
        break
      case '--serper-api-key':
        options.serperApiKey = value || undefined
        break
      default:
        break
    }
  }

  return options
}
