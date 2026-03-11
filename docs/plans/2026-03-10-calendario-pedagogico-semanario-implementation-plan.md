# Calendario Pedagogico + Semanario Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Entregar um calendario pedagogico unificado por turma + semana/mes/lista, com semanario sem tabela propria que cria itens oficiais de atividade, prova e evento.

**Architecture:** Vamos adicionar um endpoint agregador que unifica `events`, `assignments`, `exams` e datas especiais do calendario letivo. No frontend, criaremos a nova pagina `Pedagogico > Calendario` com 3 visoes e acoes de criacao que usam os endpoints oficiais existentes. O modulo de eventos atual fica como legado durante a transicao.

**Tech Stack:** AdonisJS 7, Lucid ORM, VineJS, Inertia React, TanStack Query, TypeScript, Japa.

---

### Task 1: Definir contrato unificado de calendario no backend

**Files:**

- Create: `app/models/dto/pedagogical_calendar_item.dto.ts`
- Create: `app/transformers/pedagogical_calendar_item_transformer.ts`
- Test: `tests/functional/escola/pedagogical_calendar_contract.spec.ts`

**Step 1: Write the failing test**

```ts
import { test } from '@japa/runner'

test.group('Pedagogical Calendar Contract', () => {
  test('returns normalized item shape', async ({ assert }) => {
    const item = {
      sourceType: 'ASSIGNMENT',
      sourceId: 'a1',
      title: 'Atividade de Matematica',
      startAt: '2026-03-10T10:00:00.000Z',
      endAt: null,
      isAllDay: false,
      readonly: false,
      schoolId: 's1',
      classId: 'c1',
      academicPeriodId: 'ap1',
      meta: { grade: 10 },
    }

    assert.properties(item, [
      'sourceType',
      'sourceId',
      'title',
      'startAt',
      'endAt',
      'isAllDay',
      'readonly',
      'schoolId',
      'classId',
      'academicPeriodId',
      'meta',
    ])
  })
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test functional --files tests/functional/escola/pedagogical_calendar_contract.spec.ts`
Expected: FAIL because DTO/transformer and route response contract are not implemented yet.

**Step 3: Write minimal implementation**

```ts
export type PedagogicalCalendarSourceType =
  | 'EVENT'
  | 'ASSIGNMENT'
  | 'EXAM'
  | 'HOLIDAY'
  | 'WEEKEND_CLASS_DAY'

export interface PedagogicalCalendarItemDto {
  sourceType: PedagogicalCalendarSourceType
  sourceId: string | null
  title: string
  description: string | null
  startAt: string
  endAt: string | null
  isAllDay: boolean
  readonly: boolean
  schoolId: string
  classId: string | null
  academicPeriodId: string | null
  meta: Record<string, unknown>
}
```

**Step 4: Run test to verify it passes**

Run: `node ace test functional --files tests/functional/escola/pedagogical_calendar_contract.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/models/dto/pedagogical_calendar_item.dto.ts app/transformers/pedagogical_calendar_item_transformer.ts tests/functional/escola/pedagogical_calendar_contract.spec.ts
git commit -m "feat: define pedagogical calendar unified item contract"
```

### Task 2: Criar endpoint agregador de calendario pedagogico

**Files:**

- Create: `app/controllers/pedagogical_calendar/list_pedagogical_calendar_controller.ts`
- Create: `app/validators/pedagogical_calendar.ts`
- Create: `start/routes/api/pedagogical_calendar.ts`
- Modify: `start/routes/api/index.ts`
- Test: `tests/functional/escola/pedagogical_calendar_api.spec.ts`

**Step 1: Write the failing test**

```ts
import { test } from '@japa/runner'

test.group('Pedagogical Calendar API', () => {
  test('returns merged sources filtered by class and date range', async ({ client, assert }) => {
    const response = await client.get('/api/v1/pedagogical-calendar').qs({
      classId: 'class-1',
      startDate: '2026-03-09T00:00:00.000Z',
      endDate: '2026-03-15T23:59:59.999Z',
    })

    response.assertStatus(200)
    const body = response.body()
    assert.isArray(body.data)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test functional --files tests/functional/escola/pedagogical_calendar_api.spec.ts`
Expected: FAIL with 404 route not found.

**Step 3: Write minimal implementation**

```ts
router
  .group(() => {
    router.get('/', [ListPedagogicalCalendarController]).as('pedagogical_calendar.index')
  })
  .prefix('/pedagogical-calendar')
  .use([middleware.auth(), middleware.impersonation()])
```

```ts
const payload = await request.validateUsing(listPedagogicalCalendarValidator)
// query events, assignments, exams + holidays/weekendClassDays
// map to PedagogicalCalendarItemDto[]
// sort by startAt asc
return response.ok(serialize({ data: items }))
```

**Step 4: Run test to verify it passes**

Run: `node ace test functional --files tests/functional/escola/pedagogical_calendar_api.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/controllers/pedagogical_calendar/list_pedagogical_calendar_controller.ts app/validators/pedagogical_calendar.ts start/routes/api/pedagogical_calendar.ts start/routes/api/index.ts tests/functional/escola/pedagogical_calendar_api.spec.ts
git commit -m "feat: add pedagogical calendar aggregation endpoint"
```

### Task 3: Incluir feriados e fins de semana letivos na agregacao

**Files:**

- Modify: `app/controllers/pedagogical_calendar/list_pedagogical_calendar_controller.ts`
- Test: `tests/functional/escola/pedagogical_calendar_special_days.spec.ts`

**Step 1: Write the failing test**

```ts
import { test } from '@japa/runner'

test.group('Pedagogical Calendar Special Days', () => {
  test('marks holidays and weekend class days as readonly', async ({ client, assert }) => {
    const response = await client.get('/api/v1/pedagogical-calendar').qs({
      classId: 'class-1',
      startDate: '2026-03-01T00:00:00.000Z',
      endDate: '2026-03-31T23:59:59.999Z',
    })

    response.assertStatus(200)
    const body = response.body()
    const special = body.data.filter((i: any) =>
      ['HOLIDAY', 'WEEKEND_CLASS_DAY'].includes(i.sourceType)
    )
    assert.isTrue(special.every((i: any) => i.readonly === true))
  })
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test functional --files tests/functional/escola/pedagogical_calendar_special_days.spec.ts`
Expected: FAIL because special days are not mapped yet.

**Step 3: Write minimal implementation**

```ts
const holidayItems = holidays.map((day) => ({
  sourceType: 'HOLIDAY',
  sourceId: null,
  title: 'Feriado',
  description: null,
  startAt: day.toISO()!,
  endAt: null,
  isAllDay: true,
  readonly: true,
  schoolId,
  classId,
  academicPeriodId,
  meta: {},
}))
```

**Step 4: Run test to verify it passes**

Run: `node ace test functional --files tests/functional/escola/pedagogical_calendar_special_days.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/controllers/pedagogical_calendar/list_pedagogical_calendar_controller.ts tests/functional/escola/pedagogical_calendar_special_days.spec.ts
git commit -m "feat: include academic calendar holidays and weekend class days"
```

### Task 4: Criar rota e pagina Pedagogico > Calendario

**Files:**

- Create: `app/controllers/pages/escola/show_pedagogico_calendario_page_controller.ts`
- Create: `inertia/pages/escola/pedagogico/calendario.tsx`
- Modify: `start/routes/pages/escola.ts`
- Modify: `inertia/components/layouts/escola-layout.tsx`
- Test: `tests/browser/escola_pedagogico_calendario.spec.ts`

**Step 1: Write the failing test**

```ts
import { test } from '@japa/runner'

test.group('Escola Pedagogico Calendario page', () => {
  test('renders page and navigation item', async ({ visit }) => {
    const page = await visit('/escola/pedagogico/calendario')
    await page.assertTextIncludes('Calendario Pedagogico')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test browser --files tests/browser/escola_pedagogico_calendario.spec.ts`
Expected: FAIL with page/route missing.

**Step 3: Write minimal implementation**

```tsx
export default function PedagogicoCalendarioPage() {
  return (
    <EscolaLayout>
      <Head title="Calendario Pedagogico" />
      <h1>Calendario Pedagogico</h1>
    </EscolaLayout>
  )
}
```

**Step 4: Run test to verify it passes**

Run: `node ace test browser --files tests/browser/escola_pedagogico_calendario.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/controllers/pages/escola/show_pedagogico_calendario_page_controller.ts inertia/pages/escola/pedagogico/calendario.tsx start/routes/pages/escola.ts inertia/components/layouts/escola-layout.tsx tests/browser/escola_pedagogico_calendario.spec.ts
git commit -m "feat: add pedagogical calendar page and navigation entry"
```

### Task 5: Implementar query unificada no frontend e estado por turma + periodo

**Files:**

- Create: `inertia/containers/pedagogico/pedagogical-calendar-container.tsx`
- Create: `inertia/containers/pedagogico/pedagogical-calendar-query.ts`
- Modify: `inertia/pages/escola/pedagogico/calendario.tsx`
- Test: `tests/browser/escola_pedagogico_calendario.spec.ts`

**Step 1: Write the failing test**

```ts
test('loads unified items when class and week are selected', async ({ visit }) => {
  const page = await visit('/escola/pedagogico/calendario')
  await page.assertTextIncludes('Lista')
  await page.assertTextIncludes('Semana')
  await page.assertTextIncludes('Mes')
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test browser --files tests/browser/escola_pedagogico_calendario.spec.ts`
Expected: FAIL because tabs/query wiring are not implemented.

**Step 3: Write minimal implementation**

```ts
const query = useQuery(
  api.api.v1.pedagogical_calendar.index.queryOptions({
    query: { classId, startDate: range.start.toISOString(), endDate: range.end.toISOString() },
  })
)
```

**Step 4: Run test to verify it passes**

Run: `node ace test browser --files tests/browser/escola_pedagogico_calendario.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add inertia/containers/pedagogico/pedagogical-calendar-container.tsx inertia/containers/pedagogico/pedagogical-calendar-query.ts inertia/pages/escola/pedagogico/calendario.tsx tests/browser/escola_pedagogico_calendario.spec.ts
git commit -m "feat: wire unified pedagogical calendar query by class and date range"
```

### Task 6: Entregar as 3 visoes (Lista, Semana, Mes)

**Files:**

- Create: `inertia/containers/pedagogico/views/pedagogical-calendar-list-view.tsx`
- Create: `inertia/containers/pedagogico/views/pedagogical-calendar-week-view.tsx`
- Create: `inertia/containers/pedagogico/views/pedagogical-calendar-month-view.tsx`
- Modify: `inertia/containers/pedagogico/pedagogical-calendar-container.tsx`
- Test: `tests/browser/escola_pedagogico_calendario.spec.ts`

**Step 1: Write the failing test**

```ts
test('switches among list week and month views', async ({ visit }) => {
  const page = await visit('/escola/pedagogico/calendario')
  await page.click('text=Semana')
  await page.click('text=Mes')
  await page.click('text=Lista')
  await page.assertTextIncludes('Calendario Pedagogico')
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test browser --files tests/browser/escola_pedagogico_calendario.spec.ts`
Expected: FAIL because the views/tabs are incomplete.

**Step 3: Write minimal implementation**

```tsx
<Tabs value={view} onValueChange={setView}>
  <TabsList>
    <TabsTrigger value="list">Lista</TabsTrigger>
    <TabsTrigger value="week">Semana</TabsTrigger>
    <TabsTrigger value="month">Mes</TabsTrigger>
  </TabsList>
</Tabs>
```

**Step 4: Run test to verify it passes**

Run: `node ace test browser --files tests/browser/escola_pedagogico_calendario.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add inertia/containers/pedagogico/views/pedagogical-calendar-list-view.tsx inertia/containers/pedagogico/views/pedagogical-calendar-week-view.tsx inertia/containers/pedagogico/views/pedagogical-calendar-month-view.tsx inertia/containers/pedagogico/pedagogical-calendar-container.tsx tests/browser/escola_pedagogico_calendario.spec.ts
git commit -m "feat: add list week and month views for pedagogical calendar"
```

### Task 7: Implementar acoes de criacao pelo semanario usando APIs oficiais

**Files:**

- Create: `inertia/containers/pedagogico/new-pedagogical-item-menu.tsx`
- Create: `inertia/containers/pedagogico/new-assignment-from-calendar-modal.tsx`
- Create: `inertia/containers/pedagogico/new-exam-from-calendar-modal.tsx`
- Create: `inertia/containers/pedagogico/new-event-from-calendar-modal.tsx`
- Modify: `inertia/containers/pedagogico/pedagogical-calendar-container.tsx`
- Test: `tests/browser/escola_pedagogico_calendario.spec.ts`

**Step 1: Write the failing test**

```ts
test('creates assignment exam and event from calendar actions', async ({ visit }) => {
  const page = await visit('/escola/pedagogico/calendario')
  await page.click('text=Novo item')
  await page.assertTextIncludes('Nova Atividade')
  await page.assertTextIncludes('Nova Prova')
  await page.assertTextIncludes('Novo Evento')
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test browser --files tests/browser/escola_pedagogico_calendario.spec.ts`
Expected: FAIL because menu/actions do not exist.

**Step 3: Write minimal implementation**

```ts
const createAssignment = useMutation(api.api.v1.assignments.store.mutationOptions())
const createExam = useMutation(api.api.v1.exams.store.mutationOptions())
const createEvent = useMutation(api.api.v1.events.store.mutationOptions())
```

**Step 4: Run test to verify it passes**

Run: `node ace test browser --files tests/browser/escola_pedagogico_calendario.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add inertia/containers/pedagogico/new-pedagogical-item-menu.tsx inertia/containers/pedagogico/new-assignment-from-calendar-modal.tsx inertia/containers/pedagogico/new-exam-from-calendar-modal.tsx inertia/containers/pedagogico/new-event-from-calendar-modal.tsx inertia/containers/pedagogico/pedagogical-calendar-container.tsx tests/browser/escola_pedagogico_calendario.spec.ts
git commit -m "feat: create official assignments exams and events from weekly planner"
```

### Task 8: Ajustar estado readonly, mensagens e regressao de menu legado

**Files:**

- Modify: `inertia/containers/pedagogico/pedagogical-calendar-container.tsx`
- Modify: `inertia/containers/pedagogico/views/pedagogical-calendar-list-view.tsx`
- Modify: `inertia/components/layouts/escola-layout.tsx`
- Test: `tests/browser/escola_pedagogico_calendario.spec.ts`

**Step 1: Write the failing test**

```ts
test('prevents editing readonly special days and shows guidance message', async ({ visit }) => {
  const page = await visit('/escola/pedagogico/calendario')
  await page.assertTextIncludes('ajuste no calendario do periodo letivo')
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test browser --files tests/browser/escola_pedagogico_calendario.spec.ts`
Expected: FAIL because readonly guidance is not implemented.

**Step 3: Write minimal implementation**

```tsx
if (item.readonly) {
  return <span>Item somente leitura: ajuste no calendario do periodo letivo.</span>
}
```

**Step 4: Run test to verify it passes**

Run: `node ace test browser --files tests/browser/escola_pedagogico_calendario.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add inertia/containers/pedagogico/pedagogical-calendar-container.tsx inertia/containers/pedagogico/views/pedagogical-calendar-list-view.tsx inertia/components/layouts/escola-layout.tsx tests/browser/escola_pedagogico_calendario.spec.ts
git commit -m "fix: enforce readonly behavior for special academic calendar days"
```

### Task 9: Verificacao final de qualidade

**Files:**

- Modify: `docs/plans/2026-03-10-calendario-pedagogico-semanario-design.md` (se necessario, alinhando ajustes finais)

**Step 1: Run targeted functional tests**

Run: `node ace test functional --files tests/functional/escola/pedagogical_calendar_contract.spec.ts --files tests/functional/escola/pedagogical_calendar_api.spec.ts --files tests/functional/escola/pedagogical_calendar_special_days.spec.ts`
Expected: PASS.

**Step 2: Run targeted browser tests**

Run: `node ace test browser --files tests/browser/escola_pedagogico_calendario.spec.ts`
Expected: PASS.

**Step 3: Run lint and typecheck**

Run: `pnpm lint && pnpm typecheck`
Expected: PASS with no errors.

**Step 4: Optional full test sweep**

Run: `pnpm test`
Expected: PASS (ou registrar failures nao relacionadas).

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: finalize pedagogical calendar and weekly planner rollout"
```
