# Escola Financeiro Privacy + Charts Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add two core financial charts to `/escola` and make `Mostrar/Ocultar valores` hide only monetary values (with chart blur overlay), while keeping existing tab/filter UX consistent.

**Architecture:** Add two dashboard API endpoints for revenue trend and overdue aging, both filter-aware by period/course/level/class scope. Build two new financial chart containers in Inertia using existing chart and boundary patterns. Apply a reusable chart masking overlay driven by `hideFinancialValues` so layout remains stable.

**Tech Stack:** AdonisJS, Lucid/SQL, Inertia React, TanStack Query, Recharts (via shadcn chart wrapper), Japa API/browser tests.

---

### Task 1: Add failing API tests for new financial endpoints

**Files:**

- Create: `tests/functional/dashboard/financial_charts_filters.spec.ts`

**Step 1: Write the failing test**

Add tests for:

- `GET /api/v1/escola/financial-revenue-trends`
- `GET /api/v1/escola/financial-overdue-aging`

Coverage:

- responds 200 for authenticated school user
- returns expected payload keys
- `classId` filter changes output (dataset with at least 2 classes)

**Step 2: Run test to verify it fails**

Run: `node ace test --files tests/functional/dashboard/financial_charts_filters.spec.ts`
Expected: FAIL (route/controller not found or payload mismatch)

**Step 3: Commit**

```bash
git add tests/functional/dashboard/financial_charts_filters.spec.ts
git commit -m "test: add failing coverage for financial chart dashboard endpoints"
```

### Task 2: Implement validators and routes for financial chart APIs

**Files:**

- Modify: `start/routes/api/dashboard.ts`
- Modify: `app/validators/dashboard.ts` (or existing relevant dashboard validator file)

**Step 1: Write minimal validator schemas**

Add optional fields:

- `academicPeriodId`
- `courseId`
- `levelId`
- `classId`
- `period` (`week` | `month`, default `month`) for revenue trends endpoint

**Step 2: Register routes**

Add route names under `/api/v1/escola`:

- `dashboard.escola_financial_revenue_trends`
- `dashboard.escola_financial_overdue_aging`

**Step 3: Run targeted test**

Run: `node ace test --files tests/functional/dashboard/financial_charts_filters.spec.ts`
Expected: still FAIL (controllers not implemented yet)

**Step 4: Commit**

```bash
git add start/routes/api/dashboard.ts app/validators/dashboard.ts
git commit -m "feat: add routes and query validation for financial charts"
```

### Task 3: Implement revenue trends controller

**Files:**

- Create: `app/controllers/dashboard/get_financial_revenue_trends_controller.ts`
- Modify: `start/routes/api/dashboard.ts` (bind controller)

**Step 1: Implement minimal query logic**

Return buckets with:

- `label`
- `predictedAmountCents`
- `receivedAmountCents`

Use school scope + optional filter scope based on `academicPeriodId/courseId/levelId/classId`.

**Step 2: Run tests**

Run: `node ace test --files tests/functional/dashboard/financial_charts_filters.spec.ts`
Expected: partial pass/fail (aging still failing)

**Step 3: Commit**

```bash
git add app/controllers/dashboard/get_financial_revenue_trends_controller.ts start/routes/api/dashboard.ts
git commit -m "feat: add financial revenue trends dashboard endpoint"
```

### Task 4: Implement overdue aging controller

**Files:**

- Create: `app/controllers/dashboard/get_financial_overdue_aging_controller.ts`
- Modify: `start/routes/api/dashboard.ts` (bind controller)

**Step 1: Implement minimal aging logic**

Return ranges:

- `0-30`
- `31-60`
- `61+`

For each range:

- `count`
- `amountCents`

Include totals for footer.

**Step 2: Run tests**

Run: `node ace test --files tests/functional/dashboard/financial_charts_filters.spec.ts`
Expected: PASS

**Step 3: Commit**

```bash
git add app/controllers/dashboard/get_financial_overdue_aging_controller.ts start/routes/api/dashboard.ts
git commit -m "feat: add overdue aging dashboard endpoint"
```

### Task 5: Add failing browser test for hide-values masking behavior

**Files:**

- Modify: `tests/browser/escola_dashboard_tabs.spec.ts`

**Step 1: Write failing test**

Add scenario in Financeiro tab:

- open tab
- assert financial charts present
- click `Ocultar valores`
- assert blur overlay + masked monetary labels
- assert non-monetary counts remain visible

**Step 2: Run test to verify it fails**

Run: `node ace test --files tests/browser/escola_dashboard_tabs.spec.ts --tests "...finance masking..."`
Expected: FAIL (charts not present yet)

**Step 3: Commit**

```bash
git add tests/browser/escola_dashboard_tabs.spec.ts
git commit -m "test: add failing finance hide-values masking browser check"
```

### Task 6: Create revenue trends financial chart container

**Files:**

- Create: `inertia/containers/financial/revenue-trends-chart.tsx`

**Step 1: Build container skeleton + query hook**

Use:

- `DashboardCardBoundary`
- chart UI primitives (`ChartContainer`, `ChartTooltip`)
- filters + `hideFinancialValues`

Keep title/subtitle visible during loading.

**Step 2: Add monetary masking overlay**

When `hideFinancialValues = true`:

- show blur/veil layer over plot area
- hide currency values from tooltip/summary labels

**Step 3: Run browser/API tests**

Run:

- `node ace test --files tests/functional/dashboard/financial_charts_filters.spec.ts`
- `node ace test --files tests/browser/escola_dashboard_tabs.spec.ts --tests "...finance masking..."`

Expected: second may still fail until aging chart + page wiring.

**Step 4: Commit**

```bash
git add inertia/containers/financial/revenue-trends-chart.tsx
git commit -m "feat: add financial revenue trends chart with privacy masking"
```

### Task 7: Create overdue aging financial chart container

**Files:**

- Create: `inertia/containers/financial/overdue-aging-chart.tsx`

**Step 1: Build chart**

Render aging buckets with count + amount context.

**Step 2: Apply same hide-values behavior**

Use identical masking semantics as Task 6.

**Step 3: Run targeted tests**

Run:

- `node ace test --files tests/browser/escola_dashboard_tabs.spec.ts --tests "...finance masking..."`

Expected: still may fail until page wiring.

**Step 4: Commit**

```bash
git add inertia/containers/financial/overdue-aging-chart.tsx
git commit -m "feat: add overdue aging chart with monetary masking"
```

### Task 8: Wire financial charts into `/escola` Financeiro tab

**Files:**

- Modify: `inertia/pages/escola/index.tsx`

**Step 1: Insert chart containers in financial flow**

Order:

1. filters + toggle
2. financial alerts
3. `EscolaStatsContainer`
4. `RevenueTrendsChart`
5. `OverdueAgingChart`
6. quick actions

Pass all filter props + `hideFinancialValues`.

**Step 2: Keep toggle in same row as filters**

Retain current alignment with `ml-auto` and responsive wrapping.

**Step 3: Run browser test**

Run: `node ace test --files tests/browser/escola_dashboard_tabs.spec.ts --tests "...finance masking..."`
Expected: PASS

**Step 4: Commit**

```bash
git add inertia/pages/escola/index.tsx
git commit -m "feat: wire financial charts and selective hide-values behavior"
```

### Task 9: Verification pass and regression sweep

**Files:**

- Modify (if needed): any touched files above

**Step 1: Run full targeted suite**

Run:

- `pnpm exec tsc --noEmit`
- `node ace test --files tests/functional/dashboard/financial_charts_filters.spec.ts`
- `node ace test --files tests/browser/escola_dashboard_tabs.spec.ts`

Expected: all pass.

**Step 2: Dogfood smoke pass**

Run agent-browser flow:

- verify 3 tabs render insights with same visual model
- verify finance toggle masks only monetary fields
- verify charts remain visible with blur overlay when hidden

**Step 3: Commit final polish**

```bash
git add .
git commit -m "chore: finalize financial dashboard privacy and chart UX"
```
