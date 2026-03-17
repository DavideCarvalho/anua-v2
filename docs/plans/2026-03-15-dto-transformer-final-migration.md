# DTO to Transformer Final Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove remaining DTO usage from backend controllers by migrating responses to transformers while keeping lint/typecheck/inertia typecheck green at every checkpoint.

**Architecture:** Execute domain-by-domain in descending priority using existing transformers first, then add missing transformers only when needed for parity with existing response contracts. Keep each batch small enough to isolate regressions and rely on `pnpm lint`, `pnpm typecheck`, and `pnpm typecheck:inertia` after every batch. If response shape changes from paginator metadata conventions (`meta` vs `metadata`) affect frontend types, apply targeted frontend compatibility updates in the same batch.

**Tech Stack:** AdonisJS controllers, Adonis transformers (`BaseTransformer`), TypeScript, Inertia types, pnpm scripts.

---

### Task 1: Recount and prioritize remaining DTO imports

**Files:**

- Modify: `app/controllers/**` (read-only analysis)
- Create: `docs/plans/2026-03-15-dto-transformer-final-migration.md`

**Step 1: Recount DTO usage**

Run: `python3` script to count files with DTO imports, total occurrences, unique modules.

**Step 2: Group by domain**

Run: `python3` script to aggregate counts by `app/controllers/<domain>`.

**Step 3: Build migration queue**

Order by: (a) existing transformer availability, (b) low frontend coupling, (c) high remaining count.

**Step 4: Commit checkpoint**

```bash
git add docs/plans/2026-03-15-dto-transformer-final-migration.md
git commit -m "docs: add final dto-to-transformer migration plan"
```

### Task 2: Migrate low-risk high-throughput domains first

**Files:**

- Modify: `app/controllers/achievements/*.ts`
- Modify: `app/controllers/challenges/*.ts`
- Modify: `app/controllers/comments/*.ts`
- Modify: `app/controllers/notifications/*.ts`
- Modify: `app/controllers/student_gamifications/*.ts`
- Modify: `app/controllers/student_balance_transactions/*.ts`

**Step 1: Convert controller responses to transformer serialization**

Pattern:

```ts
import DomainTransformer from '#transformers/domain_transformer'

async handle({ response, serialize }: HttpContext) {
  return response.ok(await serialize(DomainTransformer.transform(model)))
}
```

**Step 2: Remove DTO imports**

Delete `#models/dto/*.dto` imports in migrated files.

**Step 3: Verify batch**

Run:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm typecheck:inertia`

**Step 4: Commit batch**

```bash
git add app/controllers/achievements app/controllers/challenges app/controllers/comments app/controllers/notifications app/controllers/student_gamifications app/controllers/student_balance_transactions
git commit -m "refactor: migrate achievements/challenges/comments/notifications student gamification responses to transformers"
```

### Task 3: Migrate store-related controllers with existing transformers

**Files:**

- Modify: `app/controllers/stores/*.ts`
- Modify: `app/controllers/store_financial_settings/*.ts`
- Modify: `app/controllers/store_installment_rules/*.ts`

**Step 1: Switch DTO returns to transformers in target controllers**

Use existing:

- `StoreTransformer`
- `StoreFinancialSettingsTransformer`
- `StoreInstallmentRuleTransformer`

**Step 2: Verify response shapes**

Ensure store relations (`school`, `owner`, `financialSettings`) remain preloaded where expected.

**Step 3: Verify batch**

Run:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm typecheck:inertia`

**Step 4: Commit batch**

```bash
git add app/controllers/stores app/controllers/store_financial_settings app/controllers/store_installment_rules
git commit -m "refactor: migrate store and financial settings controllers to transformers"
```

### Task 4: Migrate leaderboard/event-adjacent pagination endpoints

**Files:**

- Modify: `app/controllers/leaderboards/*.ts`
- Modify: `inertia/containers/**` (only where pagination metadata typing requires adjustment)

**Step 1: Convert paginator responses to transformer paginate flow**

Pattern:

```ts
const items = paginator.all()
const metadata = paginator.getMeta()
return serialize(DomainTransformer.paginate(items, metadata))
```

**Step 2: Fix frontend paginator typing if needed**

Use `metadata` key in frontend containers where route types enforce it.

**Step 3: Verify batch**

Run:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm typecheck:inertia`

**Step 4: Commit batch**

```bash
git add app/controllers/leaderboards inertia/containers
git commit -m "refactor: migrate leaderboard responses to transformers with typed pagination"
```

### Task 5: Migrate remaining domains by priority queue

**Files:**

- Modify: `app/controllers/<domain>/*.ts` (multiple domains)
- Create/Modify: `app/transformers/*_transformer.ts` (only if missing)

**Step 1: Pick next domain from queue**

Rule: highest DTO count with existing transformer support first.

**Step 2: Migrate controllers in that single domain**

Replace DTO imports/returns with transformer + serialize.

**Step 3: Add missing transformer only when required**

Keep output parity with DTO shape where frontend relies on fields.

**Step 4: Verify domain batch**

Run:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm typecheck:inertia`

**Step 5: Commit domain batch**

```bash
git add app/controllers/<domain> app/transformers
git commit -m "refactor: migrate <domain> controllers from dto to transformers"
```

### Task 6: Completion verification and cleanup

**Files:**

- Modify: `app/controllers/**`

**Step 1: Confirm DTO imports are zero in controllers**

Run search for `#models/dto/.*\.dto` under `app/controllers`.

**Step 2: Full verification**

Run:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm typecheck:inertia`

**Step 3: Report final delta**

Capture:

- files migrated
- remaining DTO imports (expected zero)
- any intentional exceptions

**Step 4: Final commit**

```bash
git add app/controllers app/transformers inertia/containers
git commit -m "refactor: finalize dto to transformer migration in controllers"
```
