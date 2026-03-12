# Edicao em modal de atividade/prova com historico de alteracoes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Habilitar edicao de atividade e prova via modal (no calendario pedagogico e nas paginas de turma), mantendo evento via pagina, com historico auditavel por campo alterado.

**Architecture:** Reaproveitar os modais de criacao em modo `edit`, carregando dados por ID e executando update via endpoints existentes. Adicionar camada de auditoria para atividade/prova com diff por campo em tabelas de historico e endpoints de leitura. Integrar botao `Editar` nas tabelas de turma e no dialog do calendario, roteando por `sourceType`.

**Tech Stack:** AdonisJS (Lucid, controllers, validators, migrations), React + Inertia, TanStack Query, React Hook Form, Japa (functional/browser), transformers.

---

### Task 1: Criar testes RED para historico de alteracoes (atividade e prova)

**Files:**

- Modify: `tests/functional/escola/pedagogical_calendar_flow.spec.ts`
- Create: `tests/functional/escola/assignment_exam_history.spec.ts`

**Step 1: Write the failing tests**

```ts
test('creates assignment history with field-level diff on update', async ({ client, assert }) => {
  // criar atividade
  // atualizar dueDate + grade
  // assert no endpoint/lista de historico: actor + changes[] com old/new
})

test('creates exam history with field-level diff on update', async ({ client, assert }) => {
  // criar prova
  // atualizar examDate + status
  // assert historico por campo
})
```

**Step 2: Run tests to verify RED**

Run: `npm run -s test -- functional --files tests/functional/escola/assignment_exam_history.spec.ts`
Expected: FAIL (tabelas/endpoints de historico inexistentes).

**Step 3: Commit**

```bash
git add tests/functional/escola/assignment_exam_history.spec.ts tests/functional/escola/pedagogical_calendar_flow.spec.ts
git commit -m "test: add red coverage for assignment and exam edit history"
```

### Task 2: Modelagem de historico (migrations + models)

**Files:**

- Create: `database/migrations/*_create_assignment_histories_table.ts`
- Create: `database/migrations/*_create_exam_histories_table.ts`
- Create: `app/models/assignment_history.ts`
- Create: `app/models/exam_history.ts`

**Step 1: Create migrations**

```ts
// colunas minimas:
// id, assignmentId/examId, actorUserId, changedAt, changes(jsonb), createdAt, updatedAt
// indices em assignmentId/examId + changedAt
```

**Step 2: Create models**

```ts
// relations com Assignment/Exam e User
// changes tipado como array de { field, oldValue, newValue }
```

**Step 3: Run migration and type checks**

Run: `node ace migration:run`
Expected: PASS.

Run: `npm run -s typecheck`
Expected: PASS.

**Step 4: Commit**

```bash
git add database/migrations app/models/assignment_history.ts app/models/exam_history.ts
git commit -m "feat: add assignment and exam history persistence models"
```

### Task 3: Registrar historico no update de atividade

**Files:**

- Modify: `app/controllers/assignments/update_assignment_controller.ts`
- Create: `app/services/history/build_field_diff.ts`
- Modify: `app/validators/assignment.ts` (se precisar ajuste para update)

**Step 1: Implement minimal diff utility**

```ts
// buildFieldDiff(before, after, fields[])
// retorna [{ field, oldValue, newValue }] apenas para campos alterados
```

**Step 2: Write history inside assignment update flow**

```ts
// snapshot before
// update assignment
// diff
// if diff.length > 0 => create AssignmentHistory
```

**Step 3: Run targeted tests**

Run: `npm run -s test -- functional --files tests/functional/escola/assignment_exam_history.spec.ts`
Expected: teste de atividade PASS, prova ainda FAIL.

**Step 4: Commit**

```bash
git add app/controllers/assignments/update_assignment_controller.ts app/services/history/build_field_diff.ts app/validators/assignment.ts
git commit -m "feat: persist assignment field-level edit history"
```

### Task 4: Registrar historico no update de prova

**Files:**

- Modify: `app/controllers/exams/update_exam_controller.ts`
- Modify: `app/validators/exam.ts` (se necessario)

**Step 1: Implement history in exam update flow**

```ts
// mesmo padrao da atividade
// snapshot before -> update -> diff -> create ExamHistory
```

**Step 2: Run tests to verify GREEN**

Run: `npm run -s test -- functional --files tests/functional/escola/assignment_exam_history.spec.ts`
Expected: PASS para atividade e prova.

**Step 3: Commit**

```bash
git add app/controllers/exams/update_exam_controller.ts app/validators/exam.ts
git commit -m "feat: persist exam field-level edit history"
```

### Task 5: Expor endpoints de historico (atividade/prova)

**Files:**

- Create: `app/controllers/assignments/list_assignment_histories_controller.ts`
- Create: `app/controllers/exams/list_exam_histories_controller.ts`
- Create: `app/transformers/assignment_history_transformer.ts`
- Create: `app/transformers/exam_history_transformer.ts`
- Modify: `start/routes/api/assignments.ts`
- Modify: `start/routes/api/exams.ts`

**Step 1: Add list endpoints**

```ts
// GET /api/v1/assignments/:id/history
// GET /api/v1/exams/:id/history
```

**Step 2: Return serialized output**

```ts
// actor user, changedAt, changes[]
```

**Step 3: Add functional coverage**

Run: `npm run -s test -- functional --files tests/functional/escola/assignment_exam_history.spec.ts`
Expected: PASS com asserts de endpoint.

**Step 4: Commit**

```bash
git add app/controllers/assignments/list_assignment_histories_controller.ts app/controllers/exams/list_exam_histories_controller.ts app/transformers/assignment_history_transformer.ts app/transformers/exam_history_transformer.ts start/routes/api/assignments.ts start/routes/api/exams.ts
git commit -m "feat: expose assignment and exam history endpoints"
```

### Task 6: Transformar modais de criacao em modais reutilizaveis de edicao

**Files:**

- Modify: `inertia/containers/turma/new-assignment-modal.tsx`
- Modify: `inertia/containers/turma/new-exam-modal.tsx`
- Create: `inertia/containers/turma/edit-assignment-modal.tsx`
- Create: `inertia/containers/turma/edit-exam-modal.tsx`

**Step 1: Add RED browser expectation**

```ts
// editar atividade/prova deve abrir modal com campos preenchidos
```

**Step 2: Implement edit modal wrapper**

```tsx
// props: assignmentId/examId, open, onOpenChange
// carregar show endpoint
// submit update endpoint
```

**Step 3: Verify type/lint**

Run: `npm run -s typecheck`
Run: `npm run -s lint -- inertia/containers/turma/new-assignment-modal.tsx inertia/containers/turma/new-exam-modal.tsx inertia/containers/turma/edit-assignment-modal.tsx inertia/containers/turma/edit-exam-modal.tsx`
Expected: PASS.

**Step 4: Commit**

```bash
git add inertia/containers/turma/new-assignment-modal.tsx inertia/containers/turma/new-exam-modal.tsx inertia/containers/turma/edit-assignment-modal.tsx inertia/containers/turma/edit-exam-modal.tsx
git commit -m "feat: add reusable edit modals for assignments and exams"
```

### Task 7: Integrar editar por tipo no calendario pedagogico

**Files:**

- Modify: `inertia/components/event-details-dialog.tsx`
- Modify: `inertia/containers/pedagogico/pedagogical-calendar.tsx`

**Step 1: Keep event page edit and switch assignment/exam to modals**

```tsx
// sourceType ASSIGNMENT -> open EditAssignmentModal
// sourceType EXAM -> open EditExamModal
// sourceType EVENT -> router.visit(event edit page)
```

**Step 2: Verify behavior**

Run: `npm run -s test -- browser --files tests/browser/escola/pedagogico/calendario.spec.ts`
Expected: editar atividade/prova abre modal; evento continua em pagina.

**Step 3: Commit**

```bash
git add inertia/components/event-details-dialog.tsx inertia/containers/pedagogico/pedagogical-calendar.tsx
git commit -m "feat: open edit modal by pedagogical item type"
```

### Task 8: Adicionar acao Editar nas tabelas de turma

**Files:**

- Modify: `inertia/containers/turma/assignments-table.tsx`
- Modify: `inertia/containers/academico/exams-list.tsx`
- Modify: `inertia/pages/escola/periodos-letivos/[slug]/cursos/[cursoSlug]/turmas/[turmaSlug]/atividades.tsx`
- Modify: `inertia/pages/escola/periodos-letivos/[slug]/cursos/[cursoSlug]/turmas/[turmaSlug]/provas.tsx`

**Step 1: Add edit action in tables**

```tsx
// botao Editar por linha
// abre EditAssignmentModal/EditExamModal
```

**Step 2: Wire refresh after successful update**

```ts
// invalidate queries de lista + calendario
```

**Step 3: Run browser coverage**

Run: `npm run -s test -- browser --files tests/browser/escola/pedagogico/calendario.spec.ts`
Expected: PASS regressao + cenarios de editar em turma.

**Step 4: Commit**

```bash
git add inertia/containers/turma/assignments-table.tsx inertia/containers/academico/exams-list.tsx inertia/pages/escola/periodos-letivos/[slug]/cursos/[cursoSlug]/turmas/[turmaSlug]/atividades.tsx inertia/pages/escola/periodos-letivos/[slug]/cursos/[cursoSlug]/turmas/[turmaSlug]/provas.tsx
git commit -m "feat: add edit actions for assignments and exams in class pages"
```

### Task 9: Exibir timeline de historico no modal de edicao

**Files:**

- Create: `inertia/containers/turma/assignment-history-timeline.tsx`
- Create: `inertia/containers/turma/exam-history-timeline.tsx`
- Modify: `inertia/containers/turma/edit-assignment-modal.tsx`
- Modify: `inertia/containers/turma/edit-exam-modal.tsx`

**Step 1: Add history query + UI**

```tsx
// botao "Ver historico"
// lista com: data/hora, autor, campos alterados old -> new
```

**Step 2: Verify**

Run: `npm run -s typecheck && npm run -s lint -- inertia/containers/turma/assignment-history-timeline.tsx inertia/containers/turma/exam-history-timeline.tsx inertia/containers/turma/edit-assignment-modal.tsx inertia/containers/turma/edit-exam-modal.tsx`
Expected: PASS.

**Step 3: Commit**

```bash
git add inertia/containers/turma/assignment-history-timeline.tsx inertia/containers/turma/exam-history-timeline.tsx inertia/containers/turma/edit-assignment-modal.tsx inertia/containers/turma/edit-exam-modal.tsx
git commit -m "feat: show field-level edit history in assignment and exam modals"
```

### Task 10: Verificacao final integrada

**Files:**

- Modify: `docs/plans/2026-03-11-edicao-modal-atividade-prova-historico-design.md` (se ajustes finais)

**Step 1: Run final verification**

Run: `npm run -s typecheck`
Expected: PASS.

Run: `npm run -s lint`
Expected: PASS.

Run: `npm run -s test -- functional --files tests/functional/escola/assignment_exam_history.spec.ts`
Expected: PASS.

Run: `npm run -s test -- browser --files tests/browser/escola/pedagogico/calendario.spec.ts`
Expected: PASS.

**Step 2: Final commit**

```bash
git add app/controllers/assignments/update_assignment_controller.ts app/controllers/exams/update_exam_controller.ts app/controllers/assignments/list_assignment_histories_controller.ts app/controllers/exams/list_exam_histories_controller.ts app/models/assignment_history.ts app/models/exam_history.ts app/services/history/build_field_diff.ts app/transformers/assignment_history_transformer.ts app/transformers/exam_history_transformer.ts inertia/components/event-details-dialog.tsx inertia/containers/turma/edit-assignment-modal.tsx inertia/containers/turma/edit-exam-modal.tsx inertia/containers/turma/assignment-history-timeline.tsx inertia/containers/turma/exam-history-timeline.tsx inertia/containers/turma/assignments-table.tsx inertia/containers/academico/exams-list.tsx inertia/pages/escola/periodos-letivos/[slug]/cursos/[cursoSlug]/turmas/[turmaSlug]/atividades.tsx inertia/pages/escola/periodos-letivos/[slug]/cursos/[cursoSlug]/turmas/[turmaSlug]/provas.tsx database/migrations app/validators/assignment.ts app/validators/exam.ts tests/functional/escola/assignment_exam_history.spec.ts tests/browser/escola/pedagogico/calendario.spec.ts
git commit -m "feat: edit assignments and exams in modal with field-level audit history"
```
