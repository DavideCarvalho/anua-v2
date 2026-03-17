# Calendario do responsavel (lista, semana e mes) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Entregar a pagina `/responsavel/calendario` em modo somente leitura, escopada ao aluno selecionado, com visoes lista (30 dias), semana e mes usando um endpoint agregado de atividades, provas e eventos.

**Architecture:** Criar um endpoint backend unico `GET /api/v1/responsavel/students/:studentId/calendar` para validar autorizacao do responsavel e retornar itens normalizados. No frontend, adicionar uma pagina nova no modulo responsavel e um container read-only com as 3 visoes, reaproveitando a base visual de calendario existente sem acoes de criacao/edicao. Cobrir com testes funcionais de autorizacao/intervalo e teste browser de navegacao/visoes.

**Tech Stack:** AdonisJS (router, controllers, validator, Lucid), Inertia + React, TanStack Query, Japa functional/browser.

---

### Task 1: Escrever testes RED da API agregada do calendario do responsavel

**Files:**

- Create: `tests/functional/responsavel/student_calendar_api.spec.ts`
- Reuse: `tests/helpers/escola_auth.ts`

**Step 1: Write failing tests for authorization and scope**

```ts
test('returns 403 when student is not linked to responsible', async ({ client }) => {
  const response = await client
    .get(`/api/v1/responsavel/students/${studentId}/calendar`)
    .loginAs(otherResponsible)

  response.assertStatus(403)
})

test('returns assignment, exam and event items for linked student', async ({ client, assert }) => {
  const response = await client
    .get(`/api/v1/responsavel/students/${studentId}/calendar?view=list`)
    .loginAs(responsible)

  response.assertStatus(200)
  const body = response.body()
  assert.isArray(body.items)
  assert.isAbove(body.items.length, 0)
  assert.includeMembers(
    body.items.map((item: any) => item.sourceType),
    ['assignment', 'exam', 'event']
  )
})

test('applies from/to range and keeps chronological order', async ({ client, assert }) => {
  const response = await client
    .get(`/api/v1/responsavel/students/${studentId}/calendar?view=week&from=${from}&to=${to}`)
    .loginAs(responsible)

  response.assertStatus(200)
  const starts = response.body().items.map((i: any) => new Date(i.startAt).getTime())
  assert.deepEqual(
    starts,
    [...starts].sort((a, b) => a - b)
  )
})
```

**Step 2: Add DB transaction safeguards**

```ts
group.each.setup(async () => {
  await db.beginGlobalTransaction()
  return async () => db.rollbackGlobalTransaction()
})
```

**Step 3: Run test to verify RED**

Run: `npm run -s test -- functional --files tests/functional/responsavel/student_calendar_api.spec.ts`
Expected: FAIL (route/controller do calendario do responsavel ainda inexistentes).

**Step 4: Commit**

```bash
git add tests/functional/responsavel/student_calendar_api.spec.ts
git commit -m "test: add red coverage for responsible student calendar api"
```

### Task 2: Criar contrato backend (validator + DTO) para calendario agregado

**Files:**

- Create: `app/validators/responsavel_calendar.ts`
- Create: `app/models/dto/student_calendar_response.dto.ts`

**Step 1: Add query validator with sane defaults**

```ts
export const getStudentCalendarValidator = vine.compile(
  vine.object({
    view: vine.enum(['list', 'week', 'month']).optional(),
    from: vine.string().trim().optional(),
    to: vine.string().trim().optional(),
  })
)
```

**Step 2: Add DTOs for normalized response**

```ts
export class StudentCalendarItemDto {
  id: string
  sourceType: 'assignment' | 'exam' | 'event'
  sourceId: string
  title: string
  description: string | null
  startAt: string
  endAt: string | null
  allDay: boolean
  className: string | null
  subjectName: string | null
  status: string | null
  colorToken: 'assignment' | 'exam' | 'event'
}

export class StudentCalendarResponseDto {
  items: StudentCalendarItemDto[]
  meta: {
    studentId: string
    view: 'list' | 'week' | 'month'
    from: string
    to: string
    timezone: string
  }
}
```

**Step 3: Run typecheck**

Run: `npm run -s typecheck`
Expected: PASS.

**Step 4: Commit**

```bash
git add app/validators/responsavel_calendar.ts app/models/dto/student_calendar_response.dto.ts
git commit -m "feat: add responsible calendar request and response contracts"
```

### Task 3: Implementar endpoint agregado e autorizacao por aluno vinculado

**Files:**

- Create: `app/controllers/responsavel/get_student_calendar_controller.ts`
- Modify: `start/routes/api/responsavel.ts`

**Step 1: Register route under existing responsible API group**

```ts
const GetResponsavelStudentCalendarController = () =>
  import('#controllers/responsavel/get_student_calendar_controller')

router
  .get('/students/:studentId/calendar', [GetResponsavelStudentCalendarController])
  .as('student_calendar')
```

**Step 2: Implement authorization + data aggregation**

```ts
// 1) validate responsible <-> student relation via StudentHasResponsible
// 2) resolve classId/schoolId/academic periods needed for filtering
// 3) compute date range (list default 30d, otherwise from/to)
// 4) query Assignment, Exam, Event scoped to student class/school
// 5) normalize to StudentCalendarItemDto[] and sort by startAt asc
// 6) return StudentCalendarResponseDto
```

**Step 3: Explicitly map normalized item IDs and tokens**

```ts
const id = `exam:${exam.id}`
const colorToken = 'exam'
```

**Step 4: Run functional tests and verify GREEN**

Run: `npm run -s test -- functional --files tests/functional/responsavel/student_calendar_api.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/controllers/responsavel/get_student_calendar_controller.ts start/routes/api/responsavel.ts
git commit -m "feat: expose responsible student calendar aggregated endpoint"
```

### Task 4: Escrever teste browser RED para nova pagina /responsavel/calendario

**Files:**

- Create: `tests/browser/responsavel/calendario.spec.ts`

**Step 1: Write browser spec for page access and readonly UI**

```ts
// beginGlobalTransaction / rollbackGlobalTransaction

test('opens responsible calendar and shows list/week/month tabs', async ({
  visit,
  page,
  assert,
}) => {
  const auth = await createResponsavelCalendarFixtures()
  const calendarPage = await visit(`/responsavel/calendario?aluno=${auth.studentSlug}`, {
    user: auth.user,
  })

  await calendarPage.assertSee('Calendario')
  await calendarPage.assertSee('Lista')
  await calendarPage.assertSee('Semana')
  await calendarPage.assertSee('Mes')
})

test('does not show create or edit actions', async ({ visit }) => {
  const calendarPage = await visit('/responsavel/calendario?aluno=...')
  await calendarPage.assertNotSee('Novo item')
  await calendarPage.assertNotSee('Editar')
})
```

**Step 2: Run browser spec to verify RED**

Run: `npm run -s test -- browser --files tests/browser/responsavel/calendario.spec.ts`
Expected: FAIL (rota/pagina ainda nao existem).

**Step 3: Commit**

```bash
git add tests/browser/responsavel/calendario.spec.ts
git commit -m "test: add red browser coverage for responsible calendar page"
```

### Task 5: Criar pagina web e navegacao do responsavel para calendario

**Files:**

- Create: `app/controllers/pages/responsavel/show_responsavel_calendario_page_controller.ts`
- Create: `inertia/pages/responsavel/calendario.tsx`
- Modify: `start/routes/pages/responsavel.ts`
- Modify: `inertia/components/layouts/responsavel-layout.tsx`

**Step 1: Add page route and controller**

```ts
router.get('/calendario', [ShowResponsavelCalendarioPageController]).as('calendario')
```

**Step 2: Add navigation item under pedagogical section**

```ts
{
  title: 'Calendario',
  route: 'web.responsavel.calendario',
  href: '/responsavel/calendario',
  icon: Calendar,
  requiresPedagogical: true,
}
```

**Step 3: Scaffold page with selected student states**

```tsx
const { student, isLoaded } = useSelectedStudent()
if (!isLoaded) return <Skeleton />
if (!student) return <NoStudentCard />
return <StudentCalendarContainer studentId={student.id} studentName={student.name} />
```

**Step 4: Run browser test (still partial)**

Run: `npm run -s test -- browser --files tests/browser/responsavel/calendario.spec.ts --grep "opens responsible calendar"`
Expected: PASS for route/page render; remaining assertions may still fail.

**Step 5: Commit**

```bash
git add app/controllers/pages/responsavel/show_responsavel_calendario_page_controller.ts inertia/pages/responsavel/calendario.tsx start/routes/pages/responsavel.ts inertia/components/layouts/responsavel-layout.tsx
git commit -m "feat: add responsible calendar page route and navigation"
```

### Task 6: Implementar container frontend com visoes lista/semana/mes em read-only

**Files:**

- Create: `inertia/containers/responsavel/student-calendar-container.tsx`
- Modify: `inertia/pages/responsavel/calendario.tsx`

**Step 1: Wire query to new API route using api.api**

```ts
const query = useQuery(
  api.api.v1.responsavel.api.studentCalendar.queryOptions({
    params: { studentId },
    query: { view, from, to },
  })
)
```

**Step 2: Build list view (rolling 30 days)**

```tsx
// grouped by date, badge by sourceType, no edit buttons
```

**Step 3: Build week and month views with read-only interactions**

```tsx
// reuse calendar primitives; disable handlers that open create/edit flows
// disable drag/resize callbacks
```

**Step 4: Implement empty/error/loading states**

```tsx
if (isLoading) return <StudentCalendarContainerSkeleton />
if (isError) return <ErrorCard />
if (items.length === 0) return <EmptyCalendarCard />
```

**Step 5: Run targeted checks**

Run: `npm run -s typecheck`
Expected: PASS.

Run: `npm run -s test -- browser --files tests/browser/responsavel/calendario.spec.ts`
Expected: PASS.

**Step 6: Commit**

```bash
git add inertia/containers/responsavel/student-calendar-container.tsx inertia/pages/responsavel/calendario.tsx
git commit -m "feat: render responsible calendar with list week month readonly views"
```

### Task 7: Fortalecer cobertura funcional de bordas de intervalo e view defaults

**Files:**

- Modify: `tests/functional/responsavel/student_calendar_api.spec.ts`

**Step 1: Add explicit default-range test for list view**

```ts
test('uses today..today+30d when list view has no from/to', async ({ client, assert }) => {
  const response = await client
    .get(`/api/v1/responsavel/students/${studentId}/calendar?view=list`)
    .loginAs(responsible)

  response.assertStatus(200)
  const { meta } = response.body()
  assert.equal(meta.view, 'list')
})
```

**Step 2: Add invalid date range validation test**

```ts
test('returns 400 for invalid from/to', async ({ client }) => {
  const response = await client
    .get(`/api/v1/responsavel/students/${studentId}/calendar?from=bad&to=bad`)
    .loginAs(responsible)

  response.assertStatus(400)
})
```

**Step 3: Run functional suite**

Run: `npm run -s test -- functional --files tests/functional/responsavel/student_calendar_api.spec.ts`
Expected: PASS.

**Step 4: Commit**

```bash
git add tests/functional/responsavel/student_calendar_api.spec.ts
git commit -m "test: cover responsible calendar default and invalid ranges"
```

### Task 8: Verificacao final integrada

**Files:**

- Modify (if needed): `docs/plans/2026-03-13-responsavel-calendario-design.md`

**Step 1: Run final quality checks**

Run: `npm run -s typecheck`
Expected: PASS.

Run: `npm run -s test -- functional --files tests/functional/responsavel/student_calendar_api.spec.ts`
Expected: PASS.

Run: `npm run -s test -- browser --files tests/browser/responsavel/calendario.spec.ts`
Expected: PASS.

**Step 2: Sanity check route names generated by Tuyau**

Run: `npm run -s typecheck`
Expected: `api.api.v1.responsavel.api.studentCalendar` resolvido sem erro de tipo.

**Step 3: Final commit**

```bash
git add app/controllers/responsavel/get_student_calendar_controller.ts app/controllers/pages/responsavel/show_responsavel_calendario_page_controller.ts app/validators/responsavel_calendar.ts app/models/dto/student_calendar_response.dto.ts start/routes/api/responsavel.ts start/routes/pages/responsavel.ts inertia/components/layouts/responsavel-layout.tsx inertia/pages/responsavel/calendario.tsx inertia/containers/responsavel/student-calendar-container.tsx tests/functional/responsavel/student_calendar_api.spec.ts tests/browser/responsavel/calendario.spec.ts docs/plans/2026-03-13-responsavel-calendario-design.md docs/plans/2026-03-13-responsavel-calendario-implementation-plan.md
git commit -m "feat: add readonly responsible calendar with list week month views"
```
