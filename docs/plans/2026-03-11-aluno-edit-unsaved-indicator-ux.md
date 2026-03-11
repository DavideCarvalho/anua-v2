# Aluno Edit Unsaved Indicator UX Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace `Salvar *` with clearer unsaved-state indicators in the form/footer and changed steps sidebar on student edit.

**Architecture:** Keep `react-hook-form` `isDirty` as source for global pending state and derive section-level pending state from `dirtyFields`. Pass per-step change metadata to the existing sidebar component, render subtle markers there, and keep the save CTA label stable.

**Tech Stack:** React 19, react-hook-form, Inertia.js, Japa browser tests, TypeScript

---

### Task 1: Add failing E2E assertion for no asterisk in save label

**Files:**

- Modify: `tests/browser/escola/alunos/editar.spec.ts`

**Step 1: Write failing test assertion**

```ts
await page.assertExists('button:has-text("Salvar")')
const hasAsterisk = await page.locator('button:has-text("Salvar *")').count()
if (hasAsterisk > 0) throw new Error('Save label should not contain asterisk')
```

**Step 2: Run test to verify it fails**

Run: `pnpm test:browser --files tests/browser/escola/alunos/editar.spec.ts`
Expected: FAIL with current `Salvar *` rendering.

### Task 2: Replace star with footer unsaved chip

**Files:**

- Modify: `inertia/containers/edit-student/edit-student-page.tsx`

**Step 1: Implement chip rendering when form is dirty**

```tsx
{
  hasUnsavedChanges && <span>Alterações não salvas</span>
}
```

**Step 2: Keep save label stable**

```tsx
{
  fullUpdateStudent.isPending ? 'Salvando...' : 'Salvar'
}
```

**Step 3: Run test**

Run: `pnpm test:browser --files tests/browser/escola/alunos/editar.spec.ts`
Expected: PASS for no-asterisk assertion.

### Task 3: Add per-step unsaved marker in sidebar

**Files:**

- Modify: `inertia/containers/edit-student/edit-student-page.tsx`
- Modify: `inertia/containers/enrollment/enrollment-sidebar.tsx`
- Test: `tests/browser/escola/alunos/editar.spec.ts`

**Step 1: Add dirty-fields to step mapping in page**

```ts
const stepHasChanges = [
  hasDirtyValue(dirtyFields.basicInfo),
  hasDirtyValue(dirtyFields.responsibles),
  hasDirtyValue(dirtyFields.address),
  hasDirtyValue(dirtyFields.medicalInfo),
  false,
  false,
]
```

**Step 2: Extend sidebar step contract**

```ts
type EnrollmentStep = { ...; hasChanges?: boolean }
```

**Step 3: Render subtle dot marker for changed steps**

```tsx
{
  step.hasChanges ? <span data-slot="step-unsaved-dot" /> : null
}
```

**Step 4: Add E2E assertion for marker after editing name**

```ts
await page.fill('input[placeholder="Nome completo"]', 'Aluno alterado')
await page.assertExists('[data-slot="step-unsaved-dot"]')
```

**Step 5: Run targeted test**

Run: `pnpm test:browser --files tests/browser/escola/alunos/editar.spec.ts`
Expected: PASS.

### Task 4: Quality gate

**Files:**

- Modify if required by fixes: `inertia/containers/edit-student/edit-student-page.tsx`
- Modify if required by fixes: `inertia/containers/enrollment/enrollment-sidebar.tsx`
- Modify if required by fixes: `tests/browser/escola/alunos/editar.spec.ts`

**Step 1: Run lint**

Run: `pnpm lint inertia/containers/edit-student/edit-student-page.tsx inertia/containers/enrollment/enrollment-sidebar.tsx tests/browser/escola/alunos/editar.spec.ts`
Expected: no lint errors.

**Step 2: Run typecheck**

Run: `pnpm typecheck`
Expected: PASS.

**Step 3: Re-run browser tests**

Run: `pnpm test:browser --files tests/browser/escola/alunos/editar.spec.ts`
Expected: PASS.
