# Responsável Dashboard Tabs Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign `/responsavel` with `/escola`-style tabbed analytics, top intelligence cards, and strict permission-driven tab visibility per selected student.

**Architecture:** Keep `responsavelStats` as source for selected student and permissions, then compose domain containers in `inertia/pages/responsavel/index.tsx`. Implement domain intelligence/KPI/chart containers under `inertia/containers/responsavel/` and reuse existing boundary/chart primitives. Gate tabs with `pedagogical` and `financial` permissions, including single-domain no-tab-bar behavior.

**Tech Stack:** AdonisJS, Inertia React, TanStack Query, shadcn/ui, Recharts via `inertia/components/ui/chart.tsx`, Japa browser/functional tests.

---

### Task 1: Add failing browser tests for permission-based tabs

**Files:**

- Modify: `tests/browser/responsavel_dashboard.spec.ts` (create file if missing)

**Step 1: Write failing test for pedagogical-only user**

Assert:

- `Pedagógico` and `Vida Escolar` visible
- `Financeiro` hidden
- when only one domain in scenario variant, tab bar hidden

**Step 2: Write failing test for financial-only user**

Assert:

- only `Financeiro` domain visible
- no tabs bar

**Step 3: Write failing test for both permissions**

Assert tab order:

- `Pedagógico`, `Vida Escolar`, `Financeiro`

**Step 4: Run tests to verify failure**

Run: `node ace test --files tests/browser/responsavel_dashboard.spec.ts`
Expected: FAIL (new UX not implemented yet)

**Step 5: Commit**

```bash
git add tests/browser/responsavel_dashboard.spec.ts
git commit -m "test(responsavel): add failing permission-based tabs coverage"
```

### Task 2: Implement tab orchestration in `/responsavel`

**Files:**

- Modify: `inertia/pages/responsavel/index.tsx`

**Step 1: Refactor tabs to 3-domain model**

Implement domains:

- `pedagogical`
- `school-life`
- `financial`

Rules:

- pedagogical permission enables first two domains
- financial permission enables last domain

**Step 2: Implement single-domain no-tab-bar behavior**

If only one domain available:

- render content directly
- hide `TabsList`

**Step 3: Run browser tests**

Run: `node ace test --files tests/browser/responsavel_dashboard.spec.ts`
Expected: fewer failures, still failing due to missing new containers.

**Step 4: Commit**

```bash
git add inertia/pages/responsavel/index.tsx
git commit -m "feat(responsavel): add permission-driven domain tabs and single-domain mode"
```

### Task 3: Add Pedagógico intelligence and KPI containers

**Files:**

- Create: `inertia/containers/responsavel/pedagogical-insights-cards.tsx`
- Create: `inertia/containers/responsavel/pedagogical-stats-cards.tsx`

**Step 1: Write failing container test or lightweight component assertions**

Add test asserting:

- renders top intelligence cards
- empty state text `Tudo em ordem!` when no alerts

**Step 2: Implement containers with existing card style**

Use:

- `DashboardCardBoundary`
- same visual language as `/escola`

**Step 3: Keep loading semantics**

Titles/descriptions always visible; data skeleton only.

**Step 4: Run targeted tests**

Run:

- `node ace test --files tests/browser/responsavel_dashboard.spec.ts`

**Step 5: Commit**

```bash
git add inertia/containers/responsavel/pedagogical-insights-cards.tsx inertia/containers/responsavel/pedagogical-stats-cards.tsx
git commit -m "feat(responsavel): add pedagogical intelligence and KPI cards"
```

### Task 4: Add Pedagógico chart containers in 2-column grid

**Files:**

- Create: `inertia/containers/responsavel/pedagogical-grade-trends-chart.tsx`
- Create: `inertia/containers/responsavel/pedagogical-attendance-trends-chart.tsx`
- Modify: `inertia/pages/responsavel/index.tsx`

**Step 1: Implement both chart containers**

Use chart primitives and skeleton pattern from `/escola`.

**Step 2: Place charts inside `md:grid-cols-2`**

Wire in Pedagógico domain section.

**Step 3: Run browser tests**

Run: `node ace test --files tests/browser/responsavel_dashboard.spec.ts`

**Step 4: Commit**

```bash
git add inertia/containers/responsavel/pedagogical-grade-trends-chart.tsx inertia/containers/responsavel/pedagogical-attendance-trends-chart.tsx inertia/pages/responsavel/index.tsx
git commit -m "feat(responsavel): add pedagogical charts with two-column layout"
```

### Task 5: Add Vida Escolar intelligence and KPI containers

**Files:**

- Create: `inertia/containers/responsavel/school-life-insights-cards.tsx`
- Create: `inertia/containers/responsavel/school-life-stats-cards.tsx`

**Step 1: Add failing functional test for school-life payload keys**

Create/modify:

- `tests/functional/responsavel/dashboard_domains.spec.ts`

Expected keys:

- pending announcements
- pending authorizations
- recent occurrences
- upcoming events

**Step 2: Implement containers and empty state**

Use same top intelligence behavior and no-wrapper style.

**Step 3: Run functional + browser tests**

Run:

- `node ace test --files tests/functional/responsavel/dashboard_domains.spec.ts`
- `node ace test --files tests/browser/responsavel_dashboard.spec.ts`

**Step 4: Commit**

```bash
git add inertia/containers/responsavel/school-life-insights-cards.tsx inertia/containers/responsavel/school-life-stats-cards.tsx tests/functional/responsavel/dashboard_domains.spec.ts
git commit -m "feat(responsavel): add school-life intelligence and KPI domain"
```

### Task 6: Add Vida Escolar charts in 2-column grid

**Files:**

- Create: `inertia/containers/responsavel/school-life-pending-by-type-chart.tsx`
- Create: `inertia/containers/responsavel/school-life-events-timeline-chart.tsx`
- Modify: `inertia/pages/responsavel/index.tsx`

**Step 1: Implement charts**

Charts:

- pendências por tipo
- eventos/ocorrências timeline

**Step 2: Wire in domain section with `md:grid-cols-2`**

**Step 3: Run browser tests**

Run: `node ace test --files tests/browser/responsavel_dashboard.spec.ts`

**Step 4: Commit**

```bash
git add inertia/containers/responsavel/school-life-pending-by-type-chart.tsx inertia/containers/responsavel/school-life-events-timeline-chart.tsx inertia/pages/responsavel/index.tsx
git commit -m "feat(responsavel): add school-life chart grid"
```

### Task 7: Add Financeiro intelligence/KPI/charts and masking

**Files:**

- Create: `inertia/containers/responsavel/financial-insights-cards.tsx`
- Create: `inertia/containers/responsavel/financial-stats-cards.tsx`
- Create: `inertia/containers/responsavel/financial-payments-trend-chart.tsx`
- Create: `inertia/containers/responsavel/financial-overdue-aging-chart.tsx`
- Modify: `inertia/pages/responsavel/index.tsx`

**Step 1: Add failing test for financial intelligence visibility**

In browser test:

- verify top financial intelligence cards render
- verify `Financeiro` is last tab when all tabs present

**Step 2: Implement financial domain section**

Include:

- top intelligence
- KPI cards
- two-column chart grid

**Step 3: Apply monetary-only masking behavior (if toggle exists)**

Hide only currency values; keep counts visible.

**Step 4: Run tests**

Run:

- `node ace test --files tests/browser/responsavel_dashboard.spec.ts`

**Step 5: Commit**

```bash
git add inertia/containers/responsavel/financial-insights-cards.tsx inertia/containers/responsavel/financial-stats-cards.tsx inertia/containers/responsavel/financial-payments-trend-chart.tsx inertia/containers/responsavel/financial-overdue-aging-chart.tsx inertia/pages/responsavel/index.tsx
git commit -m "feat(responsavel): add financial intelligence and charts domain"
```

### Task 8: Backend support for new domain payloads

**Files:**

- Modify: `app/controllers/responsavel/get_student_overview_controller.ts`
- Modify/Create: related responsavel dashboard controllers under `app/controllers/responsavel/`
- Modify: `start/routes/api/responsavel.ts` (if new endpoint needed)

**Step 1: Add failing functional tests for full domain payload**

Tests should assert:

- domain payload is scoped by `studentId`
- missing permission excludes domain data

**Step 2: Implement minimal backend aggregation**

Return shape matching frontend containers.

**Step 3: Run functional tests**

Run: `node ace test --files tests/functional/responsavel/dashboard_domains.spec.ts`
Expected: PASS

**Step 4: Commit**

```bash
git add app/controllers/responsavel/get_student_overview_controller.ts start/routes/api/responsavel.ts tests/functional/responsavel/dashboard_domains.spec.ts
git commit -m "feat(responsavel): add scoped domain analytics payload for dashboard tabs"
```

### Task 9: Final verification and dogfood

**Files:**

- Modify: any touched files above (if fixes needed)

**Step 1: Run typecheck and tests**

Run:

- `pnpm exec tsc --noEmit`
- `node ace test --files tests/functional/responsavel/dashboard_domains.spec.ts`
- `node ace test --files tests/browser/responsavel_dashboard.spec.ts`

**Step 2: Manual dogfood flow**

Using impersonation:

- pedagogical-only responsible
- financial-only responsible
- both permissions

Verify:

- tab visibility rules
- tab order (`Financeiro` last)
- single-domain mode hides tabs list
- intelligence block stays on top

**Step 3: Commit final polish**

```bash
git add .
git commit -m "chore(responsavel): finalize tabbed domain dashboard redesign"
```
