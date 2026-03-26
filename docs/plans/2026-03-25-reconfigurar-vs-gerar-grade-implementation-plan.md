# Reconfigurar vs Gerar Grade Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Separar o fluxo de configuracao de template do fluxo de geracao da grade, com confirmacao explicita antes de overwrite.

**Architecture:** A pagina de horarios passa a centralizar o estado de configuracao do template e delega a edicao para `ScheduleConfigForm` e a geracao para `ScheduleGrid`. O formulario deixa de chamar o endpoint de geracao e vira configuracao pura. A grade assume a mutacao de geracao com dialog de confirmacao e invalida a query apos sucesso.

**Tech Stack:** React 19, Inertia, TanStack Query, AdonisJS API existente (`/api/v1/schedules/class/:classId/generate`), Japa Browser tests.

---

### Task 1: Criar cobertura de comportamento para novo fluxo da tela de horarios

**Files:**

- Create: `tests/browser/escola/pedagogico/horarios_reconfigure_generate.spec.ts`
- Modify: `tests/browser/escola_pedagogico.spec.ts`

**Step 1: Write the failing test**

```ts
test('shows Gerar Grade action and keeps Reconfigurar as config-only entry', async ({
  visit,
  browserContext,
}) => {
  const { user } = await createEscolaAuthUser()
  await browserContext.loginAs(user)

  const page = await visit('/escola/pedagogico/horarios', { timeout: 60_000 })

  await page.assertExists('text=Reconfigurar Grade')
  await page.assertExists('text=Gerar Grade')
  await page.assertNotExists('text=Recarregar')
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test browser --files tests/browser/escola/pedagogico/horarios_reconfigure_generate.spec.ts`
Expected: FAIL because `Gerar Grade` still does not exist in current grid actions.

**Step 3: Keep test scoped and deterministic**

Add minimal fixtures in this test file (academic period + class + teacherHasClass + active calendar/slot) so the grid renders action buttons.

**Step 4: Run test to verify it still fails for the right reason**

Run: `node ace test browser --files tests/browser/escola/pedagogico/horarios_reconfigure_generate.spec.ts`
Expected: FAIL on assertion for `Gerar Grade` label.

**Step 5: Commit**

```bash
git add tests/browser/escola/pedagogico/horarios_reconfigure_generate.spec.ts tests/browser/escola_pedagogico.spec.ts
git commit -m "test: cover horarios actions for reconfigure and generate"
```

### Task 2: Transformar `ScheduleConfigForm` em configuracao pura

**Files:**

- Modify: `inertia/containers/schedule/schedule-config-form.tsx`
- Test: `tests/browser/escola/pedagogico/horarios_reconfigure_generate.spec.ts`

**Step 1: Write the failing test**

```ts
test('clicking Reconfigurar Grade opens config form without triggering generation API', async ({
  visit,
  browserContext,
}) => {
  // setup fixtures and login
  const page = await visit('/escola/pedagogico/horarios?...')
  await page.click('button:has-text("Reconfigurar Grade")')
  await page.assertExists('text=Configuracao da Grade')
  await page.assertNotExists('text=Gerando...')
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test browser --files tests/browser/escola/pedagogico/horarios_reconfigure_generate.spec.ts`
Expected: FAIL because form currently exposes and runs `Gerar Grade` action itself.

**Step 3: Write minimal implementation**

- Remove `useMutation(generateClassSchedule)` from form.
- Replace submit action with config-only callback:

```ts
interface ScheduleConfigFormProps {
  classId: string
  academicPeriodId: string
  value: ScheduleConfig
  onChange: (next: ScheduleConfig) => void
  onClose?: () => void
}
```

- Keep fields and updates only; no API call in this component.

**Step 4: Run test to verify it passes**

Run: `node ace test browser --files tests/browser/escola/pedagogico/horarios_reconfigure_generate.spec.ts`
Expected: PASS for config-only behavior.

**Step 5: Commit**

```bash
git add inertia/containers/schedule/schedule-config-form.tsx tests/browser/escola/pedagogico/horarios_reconfigure_generate.spec.ts
git commit -m "refactor: make schedule config form configuration-only"
```

### Task 3: Mover acao de geracao para `ScheduleGrid` com confirmacao

**Files:**

- Modify: `inertia/containers/schedule/schedule-grid.tsx`
- Modify: `inertia/components/ui/alert-dialog.tsx` (somente se precisar de API existente para dialog)
- Test: `tests/browser/escola/pedagogico/horarios_reconfigure_generate.spec.ts`

**Step 1: Write the failing test**

```ts
test('asks confirmation before generating and calls endpoint only after confirm', async ({
  visit,
  browserContext,
}) => {
  const page = await visit('/escola/pedagogico/horarios?...')
  await page.click('button:has-text("Gerar Grade")')
  await page.assertExists('text=substituir a grade atual')

  await page.click('button:has-text("Cancelar")')
  // assert no POST /generate happened

  await page.click('button:has-text("Gerar Grade")')
  await page.click('button:has-text("Gerar nova grade")')
  // assert POST /api/v1/schedules/class/:id/generate happened once
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test browser --files tests/browser/escola/pedagogico/horarios_reconfigure_generate.spec.ts`
Expected: FAIL because grid currently has `Recarregar` and no confirmation dialog.

**Step 3: Write minimal implementation**

- Replace `Recarregar` button with `Gerar Grade`.
- Add `AlertDialog` state and actions.
- Add generation mutation in grid using existing API route.
- On confirm, call generation with current `academicPeriodId` + selected config.
- Invalidate `['classSchedule', classId, academicPeriodId]` after success.

**Step 4: Run test to verify it passes**

Run: `node ace test browser --files tests/browser/escola/pedagogico/horarios_reconfigure_generate.spec.ts`
Expected: PASS for confirmation and endpoint-call behavior.

**Step 5: Commit**

```bash
git add inertia/containers/schedule/schedule-grid.tsx tests/browser/escola/pedagogico/horarios_reconfigure_generate.spec.ts
git commit -m "feat: add confirmed generate action to schedule grid"
```

### Task 4: Orquestrar estado de configuracao na pagina de horarios

**Files:**

- Modify: `inertia/pages/escola/pedagogico/horarios.tsx`
- Modify: `inertia/containers/schedule/schedule-config-form.tsx`
- Modify: `inertia/containers/schedule/schedule-grid.tsx`
- Test: `tests/browser/escola/pedagogico/horarios_reconfigure_generate.spec.ts`

**Step 1: Write the failing test**

```ts
test('uses latest configured template when generating from grid', async ({
  visit,
  browserContext,
}) => {
  const page = await visit('/escola/pedagogico/horarios?...')
  await page.click('button:has-text("Reconfigurar Grade")')
  await page.fill('input#startTime', '08:15')
  await page.fill('input#classesPerDay', '5')
  await page.click('button:has-text("Gerar Grade")')
  await page.click('button:has-text("Gerar nova grade")')
  // assert request payload includes startTime=08:15 and classesPerDay=5
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test browser --files tests/browser/escola/pedagogico/horarios_reconfigure_generate.spec.ts`
Expected: FAIL because config state is not yet owned/shared by parent page.

**Step 3: Write minimal implementation**

- Define `scheduleConfig` state in `horarios.tsx` with current defaults.
- Pass `value/onChange` to config form.
- Pass `scheduleConfig` to grid.
- Keep current rendering rules (`hasSchedule`, `showConfigForm`) while ensuring reconfigure stays non-destructive.

**Step 4: Run test to verify it passes**

Run: `node ace test browser --files tests/browser/escola/pedagogico/horarios_reconfigure_generate.spec.ts`
Expected: PASS with payload containing latest config values.

**Step 5: Commit**

```bash
git add inertia/pages/escola/pedagogico/horarios.tsx inertia/containers/schedule/schedule-config-form.tsx inertia/containers/schedule/schedule-grid.tsx tests/browser/escola/pedagogico/horarios_reconfigure_generate.spec.ts
git commit -m "feat: wire schedule template state across horarios page and grid"
```

### Task 5: Verificacao final e regressao rapida

**Files:**

- Test: `tests/browser/escola/pedagogico/horarios_reconfigure_generate.spec.ts`
- Test: `tests/browser/escola_pedagogico.spec.ts`

**Step 1: Run focused browser suite**

Run: `node ace test browser --files tests/browser/escola/pedagogico/horarios_reconfigure_generate.spec.ts --files tests/browser/escola_pedagogico.spec.ts`
Expected: PASS.

**Step 2: Run typecheck for frontend integration safety**

Run: `npm run typecheck:inertia`
Expected: PASS sem erros em props e tipos de callbacks.

**Step 3: Smoke test manual no ambiente local**

Run: `npm run dev:server`
Expected: abrir `/escola/pedagogico/horarios`, validar fluxo completo:

- Reconfigurar abre form sem gerar.
- Gerar pede confirmacao.
- Cancelar nao chama endpoint.
- Confirmar regenera grade.

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: finalize horarios regenerate flow verification"
```
