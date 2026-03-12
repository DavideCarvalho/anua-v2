# Wizard de contexto para criacao de atividade/prova Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Permitir criar atividade e prova a partir do calendario pedagogico mesmo com turma `ALL`, usando wizard de contexto com regras por perfil e fonte de verdade baseada em `CalendarSlot` de calendario ativo em periodo ativo.

**Architecture:** Adicionar um endpoint backend unico de "creation context" que retorna periodos, series/cursos, turmas e materias filtradas por perfil e por calendario/slot valido. No frontend, implementar um wizard reutilizavel para atividade/prova: etapa de contexto (quando necessario) + etapa de conteudo. Reaproveitar modais existentes e remover bloqueio por toast quando `classId` estiver vazio.

**Tech Stack:** AdonisJS (controllers/routes/validators/Lucid), React + Inertia, TanStack Query, React Hook Form, Zod, Japa (functional/browser tests).

---

### Task 1: Criar teste funcional RED para endpoint de contexto (professor)

**Files:**

- Modify: `tests/functional/escola/pedagogical_calendar_flow.spec.ts`

**Step 1: Write the failing test**

```ts
test('returns creation context for teacher only from active period with active calendar slots', async ({
  client,
  assert,
}) => {
  const { user, school } = await createEscolaAuthUser({ role: 'SCHOOL_TEACHER' })

  // 1) criar periodo ativo + calendario ativo + slot com teacherHasClass do professor
  // 2) criar outro vinculo sem slot/sem calendario ativo (nao deve aparecer)
  // 3) chamar GET /api/v1/pedagogical-calendar/creation-context

  const response = await client.get('/api/v1/pedagogical-calendar/creation-context').loginAs(user)
  response.assertStatus(200)

  const body = response.body() as {
    data: {
      periods: Array<{ id: string }>
      classes: Array<{ id: string }>
      subjects: Array<{ id: string }>
    }
  }

  assert.lengthOf(body.data.classes, 1)
  assert.lengthOf(body.data.subjects, 1)
})
```

**Step 2: Run test to verify it fails**

Run: `npm run -s test -- functional --files tests/functional/escola/pedagogical_calendar_flow.spec.ts`
Expected: FAIL com 404 em `/api/v1/pedagogical-calendar/creation-context`.

**Step 3: Commit**

```bash
git add tests/functional/escola/pedagogical_calendar_flow.spec.ts
git commit -m "test: add red coverage for pedagogical creation context"
```

### Task 2: Implementar endpoint de creation context (GREEN minimo)

**Files:**

- Create: `app/controllers/pedagogical_calendar/get_creation_context_controller.ts`
- Modify: `start/routes/api/pedagogical_calendar.ts`
- Modify: `app/validators/pedagogical_calendar.ts`

**Step 1: Write minimal implementation**

```ts
// get_creation_context_controller.ts (estrutura minima)
// - identificar role do usuario logado
// - montar query base por school selecionada
// - para professor: join Calendar -> CalendarSlot -> TeacherHasClass
//   com AcademicPeriod.isActive, Calendar.isActive=true, isCanceled=false, slot.isBreak=false
// - retornar listas normalizadas: periods, levels/courses, classes, subjects
```

**Step 2: Add route**

```ts
router.get('/pedagogical-calendar/creation-context', [GetCreationContextController, 'handle'])
```

**Step 3: Add validator (if query params used)**

```ts
export const getPedagogicalCreationContextValidator = vine.compile(
  vine.object({
    periodId: vine.string().uuid().optional(),
    classId: vine.string().uuid().optional(),
  })
)
```

**Step 4: Run test to verify it passes**

Run: `npm run -s test -- functional --files tests/functional/escola/pedagogical_calendar_flow.spec.ts`
Expected: novo teste PASS.

**Step 5: Commit**

```bash
git add app/controllers/pedagogical_calendar/get_creation_context_controller.ts start/routes/api/pedagogical_calendar.ts app/validators/pedagogical_calendar.ts
git commit -m "feat: expose pedagogical creation context endpoint"
```

### Task 3: Cobrir regras diretor/coordenador no endpoint

**Files:**

- Modify: `tests/functional/escola/pedagogical_calendar_flow.spec.ts`
- Modify: `app/controllers/pedagogical_calendar/get_creation_context_controller.ts`

**Step 1: Write failing tests for roles**

```ts
test('director can list all available context options', async ({ client, assert }) => {
  // setup com 2 turmas elegiveis
  const response = await client
    .get('/api/v1/pedagogical-calendar/creation-context')
    .loginAs(director)
  response.assertStatus(200)
  assert.isAbove(response.body().data.classes.length, 1)
})

test('coordinator sees only coordinated scope', async ({ client, assert }) => {
  // setup coordenador com escopo parcial
  const response = await client
    .get('/api/v1/pedagogical-calendar/creation-context')
    .loginAs(coordinator)
  response.assertStatus(200)
  assert.deepEqual(
    response.body().data.classes.map((c: any) => c.id),
    [expectedClassId]
  )
})
```

**Step 2: Implement minimal role filters**

```ts
// no controller:
// if director/admin -> sem restricao adicional de role
// if coordinator -> aplicar escopo de coordenacao
// if teacher -> regra de slot/caledario ativo ja implementada
```

**Step 3: Run tests**

Run: `npm run -s test -- functional --files tests/functional/escola/pedagogical_calendar_flow.spec.ts`
Expected: PASS para os testes novos e antigos.

**Step 4: Commit**

```bash
git add tests/functional/escola/pedagogical_calendar_flow.spec.ts app/controllers/pedagogical_calendar/get_creation_context_controller.ts
git commit -m "test: enforce creation context scope by role"
```

### Task 4: Criar camada compartilhada de estado do wizard no frontend

**Files:**

- Create: `inertia/containers/pedagogico/use-pedagogical-creation-context.ts`
- Create: `inertia/containers/pedagogico/pedagogical-context-step.tsx`

**Step 1: Write failing component test or lightweight behavior test (if test infra exists)**

```ts
// pseudo: valida dependencias de selects
// period -> filtra classes
// class -> filtra subjects
// subject selecionado retorna teacherId resolvido
```

**Step 2: Implement minimal hook**

```ts
// usePedagogicalCreationContext
// - query endpoint /creation-context
// - expor options e loading
// - helpers: getClassesByPeriod, getSubjectsByClass
```

**Step 3: Implement context step UI**

```tsx
// PedagogicalContextStep
// Select: periodo, curso/serie, turma, materia
// valida obrigatorios
// callback onResolved({ classId, subjectId, teacherId, academicPeriodId })
```

**Step 4: Verify**

Run: `npm run -s typecheck && npm run -s lint -- inertia/containers/pedagogico/use-pedagogical-creation-context.ts inertia/containers/pedagogico/pedagogical-context-step.tsx`
Expected: sem erros.

**Step 5: Commit**

```bash
git add inertia/containers/pedagogico/use-pedagogical-creation-context.ts inertia/containers/pedagogico/pedagogical-context-step.tsx
git commit -m "feat: add shared pedagogical context step"
```

### Task 5: Integrar wizard ao NewAssignmentModal

**Files:**

- Modify: `inertia/containers/turma/new-assignment-modal.tsx`

**Step 1: Write failing browser/flow expectation**

```ts
// scenario: classId vazio abre etapa de contexto antes do formulario
// sem contexto valido, submit desabilitado
```

**Step 2: Implement two-step modal**

```tsx
// if !classId:
//  step 1 => <PedagogicalContextStep />
//  step 2 => formulario atual
// if classId:
//  iniciar direto no step 2
```

**Step 3: Wire final payload from resolved context**

```ts
// classId/subjectId/teacherId/academicPeriodId vindo do contexto resolvido
```

**Step 4: Verify**

Run: `npm run -s typecheck && npm run -s lint -- inertia/containers/turma/new-assignment-modal.tsx`
Expected: sem erros.

**Step 5: Commit**

```bash
git add inertia/containers/turma/new-assignment-modal.tsx
git commit -m "feat: add context wizard to assignment modal"
```

### Task 6: Integrar wizard ao NewExamModal

**Files:**

- Modify: `inertia/containers/turma/new-exam-modal.tsx`

**Step 1: Write failing browser/flow expectation**

```ts
// scenario: classId vazio abre etapa de contexto antes do formulario de prova
```

**Step 2: Implement two-step modal**

```tsx
// espelhar estrutura do modal de atividade
// reutilizar PedagogicalContextStep
```

**Step 3: Wire payload with resolved context**

```ts
// classId/subjectId/teacherId/academicPeriodId do contexto
```

**Step 4: Verify**

Run: `npm run -s typecheck && npm run -s lint -- inertia/containers/turma/new-exam-modal.tsx`
Expected: sem erros.

**Step 5: Commit**

```bash
git add inertia/containers/turma/new-exam-modal.tsx
git commit -m "feat: add context wizard to exam modal"
```

### Task 7: Remover bloqueio por toast quando turma = ALL

**Files:**

- Modify: `inertia/containers/pedagogico/pedagogical-calendar.tsx`

**Step 1: Write failing browser check**

```ts
// ao clicar "Nova atividade" ou "Nova prova" com turma ALL,
// modal deve abrir wizard (nao mostrar toast de bloqueio)
```

**Step 2: Implement minimal change**

```ts
// remover early-return com toast em handleEmptyDayAction e NewItemMenu
// deixar modal resolver contexto internamente
```

**Step 3: Verify**

Run: `npm run -s lint -- inertia/containers/pedagogico/pedagogical-calendar.tsx`
Expected: sem erros.

**Step 4: Commit**

```bash
git add inertia/containers/pedagogico/pedagogical-calendar.tsx
git commit -m "fix: allow assignment and exam creation flow from ALL classes"
```

### Task 8: Cobertura de regressao E2E/browser

**Files:**

- Modify: `tests/browser/escola/pedagogico/calendario.spec.ts`

**Step 1: Add failing scenarios**

```ts
test('opens assignment wizard when class filter is ALL', async ({ page }) => {
  // abrir calendario pedagogico
  // manter turma ALL
  // clicar novo item -> nova atividade
  // validar etapa de contexto visivel
})

test('teacher sees only slot-backed contexts in wizard', async ({ page }) => {
  // fixture professor com 1 turma valida e 1 invalida
  // validar opcoes do wizard
})
```

**Step 2: Run tests to verify RED then GREEN**

Run: `npm run -s test -- browser --files tests/browser/escola/pedagogico/calendario.spec.ts`
Expected: RED antes da implementacao, GREEN apos.

**Step 3: Commit**

```bash
git add tests/browser/escola/pedagogico/calendario.spec.ts
git commit -m "test: cover pedagogical wizard flow and role visibility"
```

### Task 9: Verificacao final integrada

**Files:**

- Modify: `docs/plans/2026-03-11-calendario-wizard-contexto-design.md` (apenas se precisar atualizar criterio)

**Step 1: Run full verification commands**

Run: `npm run -s typecheck`
Expected: PASS.

Run: `npm run -s lint`
Expected: PASS.

Run: `npm run -s test -- functional --files tests/functional/escola/pedagogical_calendar_flow.spec.ts`
Expected: PASS.

Run: `npm run -s test -- browser --files tests/browser/escola/pedagogico/calendario.spec.ts`
Expected: PASS.

**Step 2: Final commit**

```bash
git add app/controllers/pedagogical_calendar/get_creation_context_controller.ts app/validators/pedagogical_calendar.ts start/routes/api/pedagogical_calendar.ts inertia/containers/pedagogico/use-pedagogical-creation-context.ts inertia/containers/pedagogico/pedagogical-context-step.tsx inertia/containers/turma/new-assignment-modal.tsx inertia/containers/turma/new-exam-modal.tsx inertia/containers/pedagogico/pedagogical-calendar.tsx tests/functional/escola/pedagogical_calendar_flow.spec.ts tests/browser/escola/pedagogico/calendario.spec.ts
git commit -m "feat: add role-aware pedagogical creation wizard backed by active calendar slots"
```
