# Escola Financeiro Privacy + Charts Design

**Status:** approved by product direction in chat

## Context

The `Financeiro` tab in `/escola` currently has KPI cards, alerts, and quick actions, but no dedicated financial charts. The existing `Mostrar/Ocultar valores` behavior also needs to be scoped only to monetary information. We should keep UI parity with `Pedagógico` where alert cards are shown directly (without an outer wrapper card around the alert grid).

## Goals

1. `Mostrar/Ocultar valores` controls only monetary outputs.
2. Add two essential financial charts:
   - Receita prevista vs recebida por período
   - Aging de inadimplência (0-30, 31-60, 61+ dias)
3. When values are hidden, charts keep layout but monetary reading is blocked with overlay blur.
4. Preserve tab-level filters (`academicPeriodId`, `courseId`, `levelId`, `classId`) for all new financial data.

## Non-goals

- Rebuild all financial analytics in one cycle.
- Introduce new financial modules/routes beyond current dashboard API surface.
- Hide non-sensitive counts that are not monetary.

## UX Decisions

### 1) Value masking scope

- Mask monetary values only:
  - currency totals (`R$ ...`) in KPIs
  - currency values inside chart tooltips/labels
  - monetary axis ticks and summary numbers for financial charts
- Keep non-monetary counts visible (e.g., number of pending payments).

### 2) Chart behavior while hidden

- Keep each chart card rendered to avoid layout jump.
- Render a foreground overlay with:
  - subtle backdrop blur
  - opaque veil tone consistent with theme
  - short message: `Valores ocultos`
- Do not remove chart component from DOM when hidden.

### 3) Financial tab structure

- Keep filters and hide/show toggle in one row.
- Place financial alerts near top, like pedagogical style.
- Show charts after KPI cards, before quick actions.

## Data Design

## New financial chart endpoints (dashboard scope)

1. `GET /api/v1/escola/financial-revenue-trends`
   - Inputs: optional `academicPeriodId`, `courseId`, `levelId`, `classId`, optional `period` (`week`/`month` default `month`)
   - Output (per bucket):
     - `label`
     - `predictedAmountCents`
     - `receivedAmountCents`

2. `GET /api/v1/escola/financial-overdue-aging`
   - Inputs: same filters
   - Output:
     - `ranges`: `0-30`, `31-60`, `61+`
     - for each range:
       - `count`
       - `amountCents`
     - totals for footer

Both endpoints use school scope + filter-derived class/student scope aligned with current stats/insights scoping.

## Frontend Design

### New containers

- `inertia/containers/financial/revenue-trends-chart.tsx`
- `inertia/containers/financial/overdue-aging-chart.tsx`

Both:

- use `DashboardCardBoundary`
- accept `hideFinancialValues` and tab filters
- use current chart primitives from `~/components/ui/chart`
- include skeletons with fixed title/subtitle visible during loading

### Reusable masking layer

- Add a tiny reusable helper component inside financial containers (or shared if needed):
  - wraps chart content
  - conditionally renders blur overlay when `hideFinancialValues = true`

## Backend Design

- Add validators for new query params in `app/validators/dashboard.ts` (or nearest existing dashboard validator file).
- Add two new controllers in `app/controllers/dashboard/`.
- Register routes in `start/routes/api/dashboard.ts`.
- Ensure filter semantics match existing school dashboard behavior.

## Testing Strategy

- API functional tests:
  - filters reduce data correctly
  - response shape matches contract
  - empty data returns stable zero-state payload
- Frontend/browser tests:
  - charts render in financial tab
  - toggle hides currency values but keeps card structure visible
  - blur overlay appears/disappears as expected

## Risks and Mitigations

- **Risk:** confusing what is masked vs visible.
  - **Mitigation:** explicit masking utility for currency-only fields.
- **Risk:** filter mismatch across endpoints.
  - **Mitigation:** reuse same scoped filter strategy as existing stats/insights.
- **Risk:** hydration mismatch from dynamic ids.
  - **Mitigation:** avoid random/time-based rendering paths in chart skeleton/overlay.

## Rollout

1. Ship endpoints + tests.
2. Ship financial chart containers + toggle masking behavior.
3. Run dogfood pass on `/escola` across tabs for consistency.
