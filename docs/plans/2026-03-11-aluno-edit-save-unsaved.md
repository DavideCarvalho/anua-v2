# Aluno Edit Save/Unsaved Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a persistent `Salvar` button with unsaved-changes indicator and block accidental exits from the student edit page when there are unsaved changes.

**Architecture:** Reuse `react-hook-form` as the single source of truth for unsaved state via `form.formState.isDirty`. Add one shared confirmation guard used by local actions (cancel/back), Inertia navigation lifecycle, and browser tab close/refresh (`beforeunload`). Keep submit flow unchanged and continue redirecting to the students list on success.

**Tech Stack:** React 19, react-hook-form, Inertia.js, TanStack Query, Japa browser tests

---

### Task 1: Baseline E2E tests for footer actions on edit page

**Files:**

- Modify: `tests/browser/escola/alunos/editar.spec.ts`

**Step 1: Write failing test for always-visible save button**

```ts
test('shows Salvar button before final step', async ({ visit, browserContext }) => {
  const { user, school } = await createEscolaAuthUser()
  await createEnrollmentFixtures(school)
  await browserContext.loginAs(user)

  const page = await visit(
    '/escola/administrativo/alunos/11111111-1111-4111-8111-111111111111/editar'
  )
  await page.assertExists('button:has-text("Salvar")')
})
```

**Step 2: Run test to verify it fails (or is flaky for current UI)**

Run: `pnpm test:browser --files tests/browser/escola/alunos/editar.spec.ts`
Expected: FAIL for missing `Salvar` on non-final step.

**Step 3: Commit test scaffold**

```bash
git add tests/browser/escola/alunos/editar.spec.ts
git commit -m "test: cover save action visibility on edit student flow"
```

### Task 2: Add unsaved-changes state and reusable exit confirmation guard

**Files:**

- Modify: `inertia/containers/edit-student/edit-student-page.tsx`

**Step 1: Write failing behavior test for unsaved confirm on cancel**

```ts
test('asks confirmation when canceling with unsaved changes', async ({ visit, browserContext }) => {
  // setup auth + fixtures
  // open edit page
  // change one input
  // click Cancelar and assert dialog is shown
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test:browser --files tests/browser/escola/alunos/editar.spec.ts`
Expected: FAIL because no confirm guard exists yet.

**Step 3: Implement minimal unsaved guard**

```ts
const hasUnsavedChanges = form.formState.isDirty

const confirmDiscardChanges = () => {
  if (!hasUnsavedChanges) return true
  return window.confirm('Você tem alterações não salvas. Deseja sair sem salvar?')
}
```

**Step 4: Wire guard into local navigation actions**

- `Cancelar` button click handler
- `Voltar para alunos` link handler

**Step 5: Wire guard into Inertia navigation lifecycle**

- Register `router.on('before', ...)` in `useEffect`
- Cancel visit when user denies confirmation
- Unsubscribe on cleanup

**Step 6: Wire guard into browser unload**

- Register `beforeunload` when `hasUnsavedChanges` is true
- Remove listener on cleanup

**Step 7: Run test to verify pass**

Run: `pnpm test:browser --files tests/browser/escola/alunos/editar.spec.ts`
Expected: PASS for unsaved confirmation behavior.

**Step 8: Commit**

```bash
git add inertia/containers/edit-student/edit-student-page.tsx tests/browser/escola/alunos/editar.spec.ts
git commit -m "feat: guard student edit exits when form has unsaved changes"
```

### Task 3: Add persistent save button and dirty indicator

**Files:**

- Modify: `inertia/containers/edit-student/edit-student-page.tsx`
- Test: `tests/browser/escola/alunos/editar.spec.ts`

**Step 1: Write failing test for dirty indicator**

```ts
test('shows save pending indicator after editing any field', async ({ visit, browserContext }) => {
  // setup auth + fixtures
  // open edit page
  // edit input
  // assert save button indicator is visible
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test:browser --files tests/browser/escola/alunos/editar.spec.ts`
Expected: FAIL because indicator is not rendered.

**Step 3: Make save button always visible in footer**

- Keep `Próximo` behavior unchanged
- Keep `Salvar` submit action available in all steps
- Keep `isPending` loading state in button label

**Step 4: Add visual marker when dirty**

- If `hasUnsavedChanges`, render marker in save button label (example: `Salvar *`)
- Keep marker hidden when clean

**Step 5: Run tests**

Run: `pnpm test:browser --files tests/browser/escola/alunos/editar.spec.ts`
Expected: PASS.

**Step 6: Commit**

```bash
git add inertia/containers/edit-student/edit-student-page.tsx tests/browser/escola/alunos/editar.spec.ts
git commit -m "feat: add persistent save action and dirty-state indicator on edit student"
```

### Task 4: Verification and quality gate

**Files:**

- Modify (if needed): `inertia/containers/edit-student/edit-student-page.tsx`
- Modify (if needed): `tests/browser/escola/alunos/editar.spec.ts`

**Step 1: Run targeted lint/type checks**

Run: `pnpm lint inertia/containers/edit-student/edit-student-page.tsx tests/browser/escola/alunos/editar.spec.ts`
Expected: no lint errors.

**Step 2: Run typecheck**

Run: `pnpm typecheck`
Expected: PASS.

**Step 3: Re-run browser test file**

Run: `pnpm test:browser --files tests/browser/escola/alunos/editar.spec.ts`
Expected: PASS with stable behavior.

**Step 4: Final commit (if Task 4 produced fixes)**

```bash
git add inertia/containers/edit-student/edit-student-page.tsx tests/browser/escola/alunos/editar.spec.ts
git commit -m "chore: stabilize edit student save/unsaved interaction tests"
```
