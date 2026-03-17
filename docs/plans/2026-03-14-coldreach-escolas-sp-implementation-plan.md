# Coldreach Escolas SP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a CLI script that discovers private schools in Sao Paulo state and exports institutional email leads to CSV for cold outreach.

**Architecture:** Implement a modular Node.js pipeline under `scripts/coldreach/`: search adapters (Google/DuckDuckGo), site crawler, contact extractor, quality/compliance filters, dedup/scoring, and CSV export. Keep network and parsing code isolated so pure logic is unit-tested with Node's built-in test runner and fixtures.

**Tech Stack:** Node.js ESM (`.mjs`), native `fetch`, `node:test`, regex-based extraction, CSV serialization with standard library

---

### Task 1: Scaffold coldreach module and CLI argument parser

**Files:**

- Create: `scripts/coldreach/types.mjs`
- Create: `scripts/coldreach/config.mjs`
- Create: `scripts/coldreach-schools-sp.mjs`
- Test: `scripts/coldreach/__tests__/config.test.mjs`
- Modify: `package.json`

**Step 1: Write the failing test for CLI parsing defaults**

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { parseArgs } from '../config.mjs'

test('parseArgs returns default options', () => {
  const options = parseArgs([])
  assert.deepEqual(options.engines, ['google', 'duckduckgo'])
  assert.equal(options.output, 'data/leads/escolas-sp.csv')
  assert.equal(options.delayMs, 1200)
  assert.equal(options.jitterMs, 500)
  assert.equal(options.resumeFromCache, false)
})
```

**Step 2: Run test to verify it fails**

Run: `node --test scripts/coldreach/__tests__/config.test.mjs`
Expected: FAIL with `Cannot find module '../config.mjs'`.

**Step 3: Implement minimal parser and entrypoint**

```js
export function parseArgs(argv) {
  return {
    engines: ['google', 'duckduckgo'],
    output: 'data/leads/escolas-sp.csv',
    delayMs: 1200,
    jitterMs: 500,
    maxResultsPerQuery: 20,
    resumeFromCache: argv.includes('--resume-from-cache'),
    citiesFile: undefined,
    onlyRegion: undefined,
  }
}
```

In `scripts/coldreach-schools-sp.mjs`, call `parseArgs(process.argv.slice(2))` and print a placeholder message.

**Step 4: Add test command to package scripts**

```json
"test:coldreach": "node --test scripts/coldreach/__tests__/*.test.mjs"
```

**Step 5: Run test to verify it passes**

Run: `npm run test:coldreach`
Expected: PASS for `config.test.mjs`.

**Step 6: Commit**

```bash
git add package.json scripts/coldreach/types.mjs scripts/coldreach/config.mjs scripts/coldreach-schools-sp.mjs scripts/coldreach/__tests__/config.test.mjs
git commit -m "feat(coldreach): scaffold CLI options for SP school scraping"
```

---

### Task 2: Implement institutional email filtering and dedup rules

**Files:**

- Create: `scripts/coldreach/filters.mjs`
- Test: `scripts/coldreach/__tests__/filters.test.mjs`

**Step 1: Write failing tests for allowed/blocked emails**

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { isInstitutionalEmail, dedupeLeads } from '../filters.mjs'

test('isInstitutionalEmail accepts secretaria@colegio.com.br', () => {
  assert.equal(isInstitutionalEmail('secretaria@colegio-exemplo.com.br'), true)
})

test('isInstitutionalEmail rejects gmail', () => {
  assert.equal(isInstitutionalEmail('contato.escola@gmail.com'), false)
})

test('dedupeLeads removes duplicated email keeping richer record', () => {
  const input = [
    { email: 'contato@a.com.br', nome: '', cidade: 'Santos', site: 'https://a.com.br' },
    { email: 'contato@a.com.br', nome: 'Colegio A', cidade: 'Santos', site: 'https://a.com.br' },
  ]
  const out = dedupeLeads(input)
  assert.equal(out.length, 1)
  assert.equal(out[0].nome, 'Colegio A')
})
```

**Step 2: Run test to verify it fails**

Run: `npm run test:coldreach -- filters.test.mjs`
Expected: FAIL with `Cannot find module '../filters.mjs'`.

**Step 3: Implement filtering + dedup logic**

```js
const PERSONAL_DOMAINS = new Set(['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com'])

export function isInstitutionalEmail(email) {
  const normalized = String(email || '')
    .trim()
    .toLowerCase()
  const [, domain = ''] = normalized.split('@')
  if (!domain || PERSONAL_DOMAINS.has(domain)) return false
  return true
}

export function dedupeLeads(leads) {
  const map = new Map()
  for (const lead of leads) {
    const key = lead.email?.toLowerCase()
    if (!key) continue
    const current = map.get(key)
    if (!current || (lead.nome && !current.nome)) map.set(key, lead)
  }
  return [...map.values()]
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test:coldreach`
Expected: PASS for both `config.test.mjs` and `filters.test.mjs`.

**Step 5: Commit**

```bash
git add scripts/coldreach/filters.mjs scripts/coldreach/__tests__/filters.test.mjs
git commit -m "feat(coldreach): add institutional email filter and dedup rules"
```

---

### Task 3: Implement contact extraction from HTML pages

**Files:**

- Create: `scripts/coldreach/extract.mjs`
- Create: `scripts/coldreach/__tests__/fixtures/school-contact.html`
- Test: `scripts/coldreach/__tests__/extract.test.mjs`

**Step 1: Write failing extraction test**

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { extractContacts } from '../extract.mjs'

test('extractContacts reads email and phone from html', async () => {
  const html = await fs.readFile(new URL('./fixtures/school-contact.html', import.meta.url), 'utf8')
  const contacts = extractContacts(html)
  assert.deepEqual(contacts.emails, ['secretaria@colegioexemplo.com.br'])
  assert.deepEqual(contacts.phones, ['+55 13 3222-3344'])
})
```

**Step 2: Run test to verify it fails**

Run: `npm run test:coldreach -- extract.test.mjs`
Expected: FAIL with missing module/function.

**Step 3: Implement regex extraction**

```js
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
const PHONE_RE = /(?:\+55\s?)?(?:\(?\d{2}\)?\s?)?(?:9\d{4}|\d{4})[-\s]?\d{4}/g

export function extractContacts(html) {
  const emails = [...new Set((html.match(EMAIL_RE) || []).map((v) => v.toLowerCase()))]
  const phones = [...new Set(html.match(PHONE_RE) || [])]
  return { emails, phones }
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test:coldreach`
Expected: PASS including `extract.test.mjs`.

**Step 5: Commit**

```bash
git add scripts/coldreach/extract.mjs scripts/coldreach/__tests__/extract.test.mjs scripts/coldreach/__tests__/fixtures/school-contact.html
git commit -m "feat(coldreach): extract contacts from school HTML pages"
```

---

### Task 4: Implement search adapters (Google and DuckDuckGo)

**Files:**

- Create: `scripts/coldreach/search.mjs`
- Test: `scripts/coldreach/__tests__/search.test.mjs`
- Create: `scripts/coldreach/__tests__/fixtures/google-serp.html`
- Create: `scripts/coldreach/__tests__/fixtures/duckduckgo-serp.html`

**Step 1: Write failing parser tests for SERP HTML fixtures**

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { parseGoogleSerp, parseDuckduckgoSerp } from '../search.mjs'

test('parseGoogleSerp extracts school result urls', async () => {
  const html = await fs.readFile(new URL('./fixtures/google-serp.html', import.meta.url), 'utf8')
  const urls = parseGoogleSerp(html)
  assert.equal(urls[0], 'https://www.colegioexemplo.com.br')
})

test('parseDuckduckgoSerp extracts school result urls', async () => {
  const html = await fs.readFile(
    new URL('./fixtures/duckduckgo-serp.html', import.meta.url),
    'utf8'
  )
  const urls = parseDuckduckgoSerp(html)
  assert.equal(urls[0], 'https://www.escolaexemplo.com.br')
})
```

**Step 2: Run test to verify it fails**

Run: `npm run test:coldreach -- search.test.mjs`
Expected: FAIL for missing parser functions.

**Step 3: Implement basic SERP parsers + fetch wrappers**

```js
export function parseGoogleSerp(html) {
  const matches = [...html.matchAll(/<a\s+href="(https?:\/\/[^"]+)"/g)]
  return matches.map((m) => m[1]).filter((url) => !url.includes('google.'))
}

export function parseDuckduckgoSerp(html) {
  const matches = [...html.matchAll(/class="result__a"[^>]*href="([^"]+)"/g)]
  return matches.map((m) => m[1])
}
```

Also expose `searchGoogle(query, fetchImpl)` and `searchDuckduckgo(query, fetchImpl)` so network calls can be mocked in future tests.

**Step 4: Run tests to verify they pass**

Run: `npm run test:coldreach`
Expected: PASS including `search.test.mjs`.

**Step 5: Commit**

```bash
git add scripts/coldreach/search.mjs scripts/coldreach/__tests__/search.test.mjs scripts/coldreach/__tests__/fixtures/google-serp.html scripts/coldreach/__tests__/fixtures/duckduckgo-serp.html
git commit -m "feat(coldreach): add Google and DuckDuckGo search adapters"
```

---

### Task 5: Build pipeline orchestrator (queries -> crawl -> leads)

**Files:**

- Create: `scripts/coldreach/pipeline.mjs`
- Create: `scripts/coldreach/crawler.mjs`
- Create: `scripts/coldreach/score.mjs`
- Test: `scripts/coldreach/__tests__/pipeline.test.mjs`

**Step 1: Write failing pipeline integration test with mocked IO**

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { runPipeline } from '../pipeline.mjs'

test('runPipeline returns deduped institutional leads', async () => {
  const result = await runPipeline({
    cities: ['Santos'],
    search: async () => ['https://www.colegioexemplo.com.br'],
    crawl: async () => ({
      nome: 'Colegio Exemplo',
      cidade: 'Santos',
      site: 'https://www.colegioexemplo.com.br',
      emails: ['secretaria@colegioexemplo.com.br', 'escola@gmail.com'],
      phones: ['+55 13 3222-3344'],
      fonte: 'google',
    }),
  })

  assert.equal(result.length, 1)
  assert.equal(result[0].email, 'secretaria@colegioexemplo.com.br')
})
```

**Step 2: Run test to verify it fails**

Run: `npm run test:coldreach -- pipeline.test.mjs`
Expected: FAIL with missing `runPipeline`.

**Step 3: Implement minimal orchestration and scoring**

```js
export function scoreLead({ email, site, sourcePage }) {
  let score = 0
  if (email && site && email.split('@')[1] === new URL(site).hostname.replace(/^www\./, ''))
    score += 40
  if (sourcePage === 'contact') score += 25
  if (/contato|secretaria|atendimento|comercial/.test(email)) score += 20
  return score
}
```

In `runPipeline`, map crawled contacts into lead rows, apply institutional filter, dedupe, and attach `confidence_score`.

**Step 4: Run tests to verify they pass**

Run: `npm run test:coldreach`
Expected: PASS for `pipeline.test.mjs`.

**Step 5: Commit**

```bash
git add scripts/coldreach/pipeline.mjs scripts/coldreach/crawler.mjs scripts/coldreach/score.mjs scripts/coldreach/__tests__/pipeline.test.mjs
git commit -m "feat(coldreach): orchestrate search and crawl into scored leads"
```

---

### Task 6: Add CSV writer, cache/checkpoint, and wire CLI end-to-end

**Files:**

- Create: `scripts/coldreach/io.mjs`
- Modify: `scripts/coldreach-schools-sp.mjs`
- Create: `data/leads/.gitkeep`
- Create: `data/cache/.gitkeep`

**Step 1: Write failing test for CSV serialization**

Add in `scripts/coldreach/__tests__/io.test.mjs`:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { toCsv } from '../io.mjs'

test('toCsv writes expected headers and row', () => {
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
})
```

**Step 2: Run test to verify it fails**

Run: `npm run test:coldreach -- io.test.mjs`
Expected: FAIL for missing `io.mjs`.

**Step 3: Implement IO and end-to-end CLI flow**

In `io.mjs`, add:

```js
export function toCsv(rows) {
  const header = 'nome,cidade,email,telefone,site,fonte,confidence_score'
  const body = rows
    .map((row) =>
      [row.nome, row.cidade, row.email, row.telefone, row.site, row.fonte, row.confidence_score]
        .map(escapeCsv)
        .join(',')
    )
    .join('\n')
  return `${header}\n${body}\n`
}
```

In `scripts/coldreach-schools-sp.mjs`:

- load options
- run `runPipeline(options)`
- write `data/leads/escolas-sp.csv`
- write `data/leads/escolas-sp.raw.jsonl`
- write `data/leads/escolas-sp.report.json`

**Step 4: Run full coldreach test suite**

Run: `npm run test:coldreach`
Expected: all tests PASS.

**Step 5: Commit**

```bash
git add scripts/coldreach/io.mjs scripts/coldreach-schools-sp.mjs scripts/coldreach/__tests__/io.test.mjs data/leads/.gitkeep data/cache/.gitkeep
git commit -m "feat(coldreach): export CSV/report and persist cache artifacts"
```

---

### Task 7: Documentation and live smoke run

**Files:**

- Create: `docs/coldreach-escolas-sp.md`
- Modify: `docs/plans/2026-03-14-coldreach-escolas-sp-design.md` (link implementation and execution docs)

**Step 1: Write operator doc with examples**

Include:

- command examples
- required output files
- known limitations (SERP blocks/captcha)
- compliance note (institutional emails only)

**Step 2: Run a smoke command with a tiny scope**

Run:

```bash
node scripts/coldreach-schools-sp.mjs --only-region=baixada-santista --max-results-per-query=3 --output=data/leads/escolas-sp-smoke.csv
```

Expected:

- command exits 0
- `data/leads/escolas-sp-smoke.csv` created
- `data/leads/escolas-sp.report.json` created with counters

**Step 3: Verify output headers and row count quickly**

Run:

```bash
node -e "import fs from 'node:fs'; const csv = fs.readFileSync('data/leads/escolas-sp-smoke.csv','utf8'); console.log(csv.split('\n')[0]); console.log(csv.split('\n').length - 2)"
```

Expected:

- first line: `nome,cidade,email,telefone,site,fonte,confidence_score`
- second output: non-negative integer row count

**Step 4: Commit**

```bash
git add docs/coldreach-escolas-sp.md docs/plans/2026-03-14-coldreach-escolas-sp-design.md
git commit -m "docs(coldreach): add runbook for SP schools outreach pipeline"
```

---

### Task 8: Final verification gate

**Files:**

- No file changes expected

**Step 1: Run lint on new scripts only**

Run:

```bash
npx eslint scripts/coldreach-schools-sp.mjs scripts/coldreach/*.mjs
```

Expected: no lint errors.

**Step 2: Re-run tests**

Run:

```bash
npm run test:coldreach
```

Expected: all PASS.

**Step 3: Optional full project checks before PR**

Run:

```bash
npm run lint && npm run typecheck
```

Expected: no regressions.

**Step 4: Commit verification evidence (if any generated report changed)**

```bash
git status
```

Expected: clean working tree (or only intentional files).
