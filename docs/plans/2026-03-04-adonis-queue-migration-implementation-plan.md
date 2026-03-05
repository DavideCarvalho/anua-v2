# Adonis Queue Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace `@boringnode/queue` with `@adonisjs/queue` across the codebase, keeping database-backed queues in non-local environments and sync execution for local development.

**Architecture:** Migrate to Adonis Queue native provider/commands/config and remove custom queue bootstrap layers. Keep job classes and queue names stable while updating imports and runtime wiring. Validate with targeted smoke flows and queue worker checks.

**Tech Stack:** AdonisJS v7, TypeScript, `@adonisjs/queue`, Lucid/PostgreSQL, Ace commands, Japa tests.

---

### Task 1: Install and register Adonis Queue package

**Files:**

- Modify: `package.json`
- Modify: `adonisrc.ts`

**Step 1: Write the failing test**

Create a minimal console test file to assert command/provider registration shape.

```ts
import { test } from '@japa/runner'
import appConfig from '#adonisrc'

test('adonis queue provider and commands are registered', ({ assert }) => {
  const hasQueueProvider = appConfig.providers.some((entry) =>
    String(entry).includes('@adonisjs/queue/queue_provider')
  )
  assert.isTrue(hasQueueProvider)
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test tests/unit/queue/registration.spec.ts`
Expected: FAIL because queue provider/commands are not yet registered.

**Step 3: Write minimal implementation**

- Add pinned dependency for `@adonisjs/queue`.
- Register queue commands and provider in `adonisrc.ts`.
- Remove old custom queue provider registration.

```ts
commands: [
  // ...
  () => import('@adonisjs/queue/commands'),
]

providers: [
  // ...
  () => import('@adonisjs/queue/queue_provider'),
]
```

**Step 4: Run test to verify it passes**

Run: `node ace test tests/unit/queue/registration.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add package.json adonisrc.ts tests/unit/queue/registration.spec.ts
git commit -m "refactor(queue): register adonis queue provider and commands"
```

### Task 2: Replace queue configuration with defineConfig/drivers

**Files:**

- Modify: `config/queue.ts`

**Step 1: Write the failing test**

Add a unit test asserting both adapters exist and local-friendly default behavior.

```ts
import { test } from '@japa/runner'
import queueConfig from '#config/queue'

test('queue config declares database and sync adapters', ({ assert }) => {
  assert.exists(queueConfig.adapters.database)
  assert.exists(queueConfig.adapters.sync)
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test tests/unit/queue/config.spec.ts`
Expected: FAIL because old boringnode config shape does not expose Adonis adapters.

**Step 3: Write minimal implementation**

Use Adonis queue config API.

```ts
import env from '#start/env'
import { defineConfig, drivers } from '@adonisjs/queue'

export default defineConfig({
  default: env.get('QUEUE_DRIVER', app.inDev ? 'sync' : 'database'),
  adapters: {
    database: drivers.database({ connectionName: 'primary' }),
    sync: drivers.sync(),
  },
  worker: {
    concurrency: 2,
    idleDelay: '1s',
  },
  locations: ['./app/jobs/**/*.ts'],
})
```

**Step 4: Run test to verify it passes**

Run: `node ace test tests/unit/queue/config.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add config/queue.ts tests/unit/queue/config.spec.ts
git commit -m "refactor(queue): migrate queue config to adonis drivers"
```

### Task 3: Migrate all job classes to @adonisjs/queue Job import

**Files:**

- Modify: `app/jobs/**/*.ts`

**Step 1: Write the failing test**

Add a static check test asserting there are no `@boringnode/queue` job imports.

```ts
import { test } from '@japa/runner'
import { readFileSync } from 'node:fs'
import { globSync } from 'glob'

test('jobs do not import boringnode queue', ({ assert }) => {
  const files = globSync('app/jobs/**/*.ts')
  const offenders = files.filter((f) => readFileSync(f, 'utf8').includes("'@boringnode/queue'"))
  assert.deepEqual(offenders, [])
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test tests/unit/queue/jobs-imports.spec.ts`
Expected: FAIL listing offending files.

**Step 3: Write minimal implementation**

Replace import line in each job file:

```ts
import { Job } from '@adonisjs/queue'
```

**Step 4: Run test to verify it passes**

Run: `node ace test tests/unit/queue/jobs-imports.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/jobs/**/*.ts tests/unit/queue/jobs-imports.spec.ts
git commit -m "refactor(jobs): switch jobs to adonis queue base class"
```

### Task 4: Remove manual queue bootstrap from dispatch paths

**Files:**

- Modify: `start/scheduler.ts`
- Modify: `app/controllers/**/*.ts` (files with `getQueueManager()`)
- Modify: `commands/dispatch_gamification_retry.ts`
- Modify: `commands/dispatch_gamification_streaks.ts`

**Step 1: Write the failing test**

Add a static test for banned symbol usage.

```ts
import { test } from '@japa/runner'
import { readFileSync } from 'node:fs'
import { globSync } from 'glob'

test('no getQueueManager bootstrap calls remain', ({ assert }) => {
  const files = globSync('{app,start,commands}/**/*.ts')
  const offenders = files.filter((f) => readFileSync(f, 'utf8').includes('getQueueManager('))
  assert.deepEqual(offenders, [])
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test tests/unit/queue/no-bootstrap.spec.ts`
Expected: FAIL with existing references.

**Step 3: Write minimal implementation**

- Remove `getQueueManager` imports.
- Remove `await getQueueManager()` calls.
- Keep direct `Job.dispatch(...)` usage.

**Step 4: Run test to verify it passes**

Run: `node ace test tests/unit/queue/no-bootstrap.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add start/scheduler.ts app/controllers/**/*.ts commands/*.ts tests/unit/queue/no-bootstrap.spec.ts
git commit -m "refactor(queue): remove manual queue manager bootstrap"
```

### Task 5: Remove obsolete custom queue files and worker command

**Files:**

- Delete: `providers/queue_provider.ts`
- Delete: `app/services/queue_service.ts`
- Delete: `commands/queue_work.ts`

**Step 1: Write the failing test**

Add static test checking these files do not exist and command still available from package.

```ts
import { test } from '@japa/runner'
import { existsSync } from 'node:fs'

test('legacy queue files are removed', ({ assert }) => {
  assert.isFalse(existsSync('providers/queue_provider.ts'))
  assert.isFalse(existsSync('app/services/queue_service.ts'))
  assert.isFalse(existsSync('commands/queue_work.ts'))
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test tests/unit/queue/legacy-files.spec.ts`
Expected: FAIL because files still exist.

**Step 3: Write minimal implementation**

- Delete old files.
- Ensure no imports refer to deleted files.

**Step 4: Run test to verify it passes**

Run: `node ace test tests/unit/queue/legacy-files.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add -A
git commit -m "chore(queue): remove legacy custom queue implementation"
```

### Task 6: Update runtime scripts and docs snippets

**Files:**

- Modify: `package.json`
- Modify: `MIGRATION.md` (queue setup sections)

**Step 1: Write the failing test**

Create a unit/static test checking script commands and package references.

```ts
import { test } from '@japa/runner'
import pkg from '#../package.json'

test('queue scripts rely on official queue:work command', ({ assert }) => {
  assert.include(pkg.scripts.dev, 'queue:work')
  assert.notInclude(JSON.stringify(pkg.dependencies), '@boringnode/queue')
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test tests/unit/queue/scripts.spec.ts`
Expected: FAIL while old dependency/docs references remain.

**Step 3: Write minimal implementation**

- Keep scripts pointing to official `node ace queue:work`.
- Replace docs examples from boringnode naming to Adonis queue package.

**Step 4: Run test to verify it passes**

Run: `node ace test tests/unit/queue/scripts.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add package.json MIGRATION.md tests/unit/queue/scripts.spec.ts
git commit -m "docs(queue): update scripts and migration notes for adonis queue"
```

### Task 7: Verify end-to-end queue behavior (sync + database)

**Files:**

- Test: `tests/functional/**/*.spec.ts` (existing and/or new smoke tests)

**Step 1: Write the failing test**

Add one functional queue smoke that dispatches a representative job and asserts expected side effect.

```ts
import { test } from '@japa/runner'
import { QueueManager } from '@adonisjs/queue'
import ProcessGamificationEventJob from '#jobs/gamification/process_gamification_event_job'

test('dispatches gamification job', ({ assert }) => {
  const fake = QueueManager.fake()
  ProcessGamificationEventJob.dispatch({ eventId: 'test' as any })
  fake.assertPushed(ProcessGamificationEventJob)
  QueueManager.restore()
  assert.isTrue(true)
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test tests/functional/queue/dispatch.spec.ts`
Expected: FAIL until migration is complete.

**Step 3: Write minimal implementation**

- Fix imports/config mismatches surfaced by test.
- Ensure fake queue API is used correctly.

**Step 4: Run test to verify it passes**

Run: `node ace test tests/functional/queue/dispatch.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add tests/functional/queue/dispatch.spec.ts
git commit -m "test(queue): add functional smoke for job dispatch"
```

### Task 8: Final verification checklist

**Files:**

- Verify: `app/**/*.ts`
- Verify: `start/**/*.ts`
- Verify: `commands/**/*.ts`

**Step 1: Write the failing test**

Add final guard test asserting no stale symbols/packages remain.

```ts
import { test } from '@japa/runner'
import { readFileSync } from 'node:fs'
import { globSync } from 'glob'

test('no stale boringnode queue references remain', ({ assert }) => {
  const files = globSync('{app,start,commands,providers,config}/**/*.ts')
  const offenders = files.filter((f) => {
    const content = readFileSync(f, 'utf8')
    return content.includes('@boringnode/queue') || content.includes('getQueueManager')
  })
  assert.deepEqual(offenders, [])
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test tests/unit/queue/no-stale-references.spec.ts`
Expected: FAIL until all references are removed.

**Step 3: Write minimal implementation**

- Remove last stale references.
- Fix any broken imports after cleanup.

**Step 4: Run test to verify it passes**

Run: `node ace test tests/unit/queue/no-stale-references.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add -A
git commit -m "refactor(queue): finalize adonis queue migration and cleanup"
```

### Task 9: Operational verification commands

**Files:**

- Verify only (no mandatory code change)

**Step 1: Run local sync mode smoke**

Run: `QUEUE_DRIVER=sync node ace test tests/functional/queue/dispatch.spec.ts`
Expected: PASS and immediate execution behavior.

**Step 2: Run database worker smoke**

Run: `QUEUE_DRIVER=database node ace queue:work --queue=payments,gamification --concurrency=2`
Expected: Worker starts successfully with no boot errors.

**Step 3: Run project checks**

Run: `node ace test && npm run typecheck`
Expected: PASS.

**Step 4: Commit verification notes**

```bash
git add docs/plans/2026-03-04-adonis-queue-migration-design.md docs/plans/2026-03-04-adonis-queue-migration-implementation-plan.md
git commit -m "docs(queue): add adonis queue migration design and execution plan"
```
