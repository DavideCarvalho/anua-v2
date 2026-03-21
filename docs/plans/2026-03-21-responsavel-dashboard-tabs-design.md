# Responsável Dashboard Tabs Design

## Context

We will redesign `/responsavel` to follow the same visual and information hierarchy style used in `/escola`: top intelligence cards, fixed KPI cards, two-column chart grid, and consistent loading/empty states. The new dashboard must be permission-driven per selected student relation.

## Permission Rules (Approved)

- Show `Pedagógico` and `Vida Escolar` tabs only when `selectedStudent.permissions.pedagogical = true`.
- Show `Financeiro` tab only when `selectedStudent.permissions.financial = true`.
- If both permissions are true, show all tabs in this order:
  1. `Pedagógico`
  2. `Vida Escolar`
  3. `Financeiro`
- If only one tab is available, hide tab bar and render content directly.

## UX Structure

Each visible tab follows this layout:

1. Intelligence cards (priority alerts) at top
2. Fixed KPI cards
3. Graphs in `md:grid-cols-2`
4. Action/quick links section (optional)

Loading behavior:

- Keep card title and subtitle visible during loading.
- Skeleton only for API-backed numbers/plots.

Empty intelligence behavior:

- Same pattern as `/escola`: `Tudo em ordem!` + contextual description.
- No extra wrapper card around intelligence card grid when there are alerts.

## Domain Content (V1)

## Pedagógico

- Intelligence:
  - frequência crítica
  - atividades vencidas
  - queda recente de desempenho
- KPIs:
  - frequência média
  - média atual
  - atividades pendentes
- Charts:
  - tendência de notas
  - tendência de frequência

## Vida Escolar

- Intelligence:
  - comunicados pendentes de ciência
  - autorizações pendentes
  - ocorrências recentes
  - eventos da semana
- KPIs:
  - pendências por tipo
  - ocorrências abertas
  - eventos próximos (7 dias)
- Charts:
  - pendências por tipo (barra)
  - linha temporal de eventos/ocorrências

## Financeiro

- Intelligence:
  - faturas vencidas
  - faturas a vencer (7 dias)
  - risco de atraso recorrente
- KPIs:
  - saldo pendente
  - vencidas
  - a vencer
- Charts:
  - receita/recebimento do aluno vs previsão
  - aging de atrasos

## Privacy

- Keep financial masking logic scoped to monetary values only.
- Counts and non-currency descriptions remain visible.

## Data and API Strategy

- Keep `api.v1.dashboard.responsavelStats` for selected student, permissions, and top-level context.
- Add or extend responsavel dashboard endpoints to return domain sections:
  - `pedagogical`
  - `schoolLife`
  - `financial`
- Every response scoped by selected `studentId`.

## Component Strategy

- Page orchestrator: `inertia/pages/responsavel/index.tsx`
- Reusable boundary + skeleton pattern from `/escola`:
  - `DashboardCardBoundary`
  - chart UI primitives in `inertia/components/ui/chart.tsx`
- New containers under `inertia/containers/responsavel/` per domain for:
  - intelligence cards
  - KPIs
  - charts

## Testing Strategy

- Browser tests for permission combinations:
  - pedagogical only
  - financial only
  - both permissions
- Assert tab visibility/order and single-tab no-tabs-bar behavior.
- Assert intelligence block appears on top in all visible domains.
- Functional tests for new/extended endpoints and scoped payload.

## Rollout

1. Build tab orchestration + permission gating.
2. Add Pedagógico domain parity first.
3. Add Vida Escolar domain.
4. Add Financeiro domain and masking checks.
5. Final dogfood pass with responsible impersonation flow.
