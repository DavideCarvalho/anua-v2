# Comunicados: Alunos Especificos Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Adicionar o preset exclusivo "Alunos especificos" em comunicados e garantir persistencia/publicacao com audiencia por aluno.

**Architecture:** Reusar o mesmo pipeline de audiencia de comunicados (`SchoolAnnouncementAudience`) com novo `scopeType: STUDENT`. A UI de `novo comunicado` passa a enviar `audienceStudentIds` quando o preset dedicado estiver ativo. A resolucao de destinatarios continua centralizada em `resolveAudienceStudentIds`, com deduplicacao por `Set`.

**Tech Stack:** AdonisJS, Lucid ORM, Vine validator, Inertia React, Japa (functional/browser)

---

### Task 1: Cobrir contrato de API para `audienceStudentIds`

**Files:**

- Modify: `tests/functional/escola/school_announcements_api.spec.ts`
- Test: `tests/functional/escola/school_announcements_api.spec.ts`

**Step 1: Write the failing test**

Adicionar dois testes novos:

```ts
test('creates draft with student audience ids', async ({ client, assert }) => {
  // cria escola, aluno e responsavel
  // POST /api/v1/school-announcements com audienceStudentIds: [studentId]
  // assert 201 e audiences contem scopeType STUDENT
})

test('rejects create when student audience is from another school', async ({ client, assert }) => {
  // cria aluno em outra escola
  // POST com audienceStudentIds externo
  // assert 400 com mensagem de aluno invalido
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test tests/functional/escola/school_announcements_api.spec.ts --match "student audience"`
Expected: FAIL com campo desconhecido/nao persistido (`audienceStudentIds`).

**Step 3: Write minimal implementation**

Ainda sem implementar tudo; apenas deixe os testes registrados como contrato esperado.

**Step 4: Run test to verify it still fails for the right reason**

Run: `node ace test tests/functional/escola/school_announcements_api.spec.ts --match "student audience"`
Expected: FAIL consistente de validacao/ausencia do escopo `STUDENT`.

**Step 5: Commit**

```bash
git add tests/functional/escola/school_announcements_api.spec.ts
git commit -m "test(comunicados): define student audience api expectations"
```

### Task 2: Habilitar `audienceStudentIds` no backend (validator + model + service)

**Files:**

- Modify: `app/validators/school_announcement.ts`
- Modify: `app/models/school_announcement_audience.ts`
- Modify: `app/services/school_announcements/school_announcement_audience_service.ts`
- Test: `tests/functional/escola/school_announcements_api.spec.ts`

**Step 1: Write the failing test**

Usar os testes da Task 1 como guia de falha.

**Step 2: Run test to verify it fails**

Run: `node ace test tests/functional/escola/school_announcements_api.spec.ts --match "student audience"`
Expected: FAIL.

**Step 3: Write minimal implementation**

Aplicar mudancas:

```ts
// app/validators/school_announcement.ts
audienceStudentIds: vine.array(vine.string().trim()).optional()

// app/models/school_announcement_audience.ts
export type SchoolAnnouncementAudienceScopeType =
  | 'ACADEMIC_PERIOD'
  | 'COURSE'
  | 'LEVEL'
  | 'CLASS'
  | 'STUDENT'
```

```ts
// app/services/school_announcements/school_announcement_audience_service.ts
interface AnnouncementAudienceInput {
  audienceStudentIds?: string[]
}

interface AnnouncementAudienceResolved {
  audienceStudentIds: string[]
}

// incluir STUDENT em normalize, ensureAudience, sync, resolve config
// validateAudienceIds: validar Student.id pertencente a schoolId
// resolveAudienceStudentIds: adicionar audienceStudentIds ao Set
```

**Step 4: Run test to verify it passes**

Run: `node ace test tests/functional/escola/school_announcements_api.spec.ts --match "student audience"`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/validators/school_announcement.ts app/models/school_announcement_audience.ts app/services/school_announcements/school_announcement_audience_service.ts tests/functional/escola/school_announcements_api.spec.ts
git commit -m "feat(comunicados): add student audience scope support"
```

### Task 3: Passar `audienceStudentIds` nos controllers de create/update

**Files:**

- Modify: `app/controllers/school_announcements/create_school_announcement_controller.ts`
- Modify: `app/controllers/school_announcements/update_school_announcement_controller.ts`
- Test: `tests/functional/escola/school_announcements_api.spec.ts`

**Step 1: Write the failing test**

Adicionar teste cobrindo update de rascunho com troca para `audienceStudentIds`:

```ts
test('updates draft audience to specific students', async ({ client, assert }) => {
  // cria draft com turma
  // PUT com audienceStudentIds
  // GET detalhe e assert audiences STUDENT
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test tests/functional/escola/school_announcements_api.spec.ts --match "updates draft audience to specific students"`
Expected: FAIL por `audienceStudentIds` nao aplicado no update.

**Step 3: Write minimal implementation**

Incluir campo no payload enviado a `syncSchoolAnnouncementAudience`:

```ts
audienceStudentIds: payload.audienceStudentIds
```

No update, incluir no merge de audiencia com fallback de config atual.

**Step 4: Run test to verify it passes**

Run: `node ace test tests/functional/escola/school_announcements_api.spec.ts --match "specific students"`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/controllers/school_announcements/create_school_announcement_controller.ts app/controllers/school_announcements/update_school_announcement_controller.ts tests/functional/escola/school_announcements_api.spec.ts
git commit -m "feat(comunicados): wire student audience in create and update flows"
```

### Task 4: Expor lista de alunos para preset da UI

**Files:**

- Create: `app/controllers/school_announcements/list_school_announcement_students_controller.ts`
- Modify: `start/routes/api/school_announcements.ts`
- Test: `tests/functional/escola/school_announcements_api.spec.ts`

**Step 1: Write the failing test**

Adicionar teste:

```ts
test('lists students for announcement audience in selected school', async ({ client, assert }) => {
  // GET /api/v1/school-announcements/audience/students
  // assert 200 e apenas alunos da escola selecionada
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test tests/functional/escola/school_announcements_api.spec.ts --match "audience students"`
Expected: FAIL com 404 rota inexistente.

**Step 3: Write minimal implementation**

Criar controller retornando lista enxuta:

```ts
return response.ok({
  data: students.map((student) => ({ id: student.id, name: student.user.name })),
})
```

Adicionar rota autenticada:

```ts
router
  .get('/audience/students', [ListSchoolAnnouncementStudentsController])
  .as('school_announcements.audience_students')
```

**Step 4: Run test to verify it passes**

Run: `node ace test tests/functional/escola/school_announcements_api.spec.ts --match "audience students"`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/controllers/school_announcements/list_school_announcement_students_controller.ts start/routes/api/school_announcements.ts tests/functional/escola/school_announcements_api.spec.ts
git commit -m "feat(comunicados): add students audience listing endpoint"
```

### Task 5: Implementar preset "Alunos especificos" na tela de novo comunicado

**Files:**

- Modify: `inertia/pages/escola/comunicados/novo.tsx`
- Test: `tests/browser/escola/dashboard_view_mode.spec.ts`

**Step 1: Write the failing test**

Expandir teste de presets para incluir novo botao e bloco:

```ts
await newAnnouncementPage.assertExists('button:has-text("Alunos específicos")')
await newAnnouncementPage.click('button:has-text("Alunos específicos")')
await newAnnouncementPage.assertExists('[data-testid="announcement-audience-student-options"]')
```

**Step 2: Run test to verify it fails**

Run: `node ace test tests/browser/escola/dashboard_view_mode.spec.ts --match "simplified audience presets"`
Expected: FAIL por ausencia do novo preset.

**Step 3: Write minimal implementation**

Em `novo.tsx`:

```tsx
type AudiencePreset = 'all' | 'course' | 'level' | 'class' | 'student'
const [students, setStudents] = useState<Option[]>([])
const [audienceStudentIds, setAudienceStudentIds] = useState<string[]>([])

// carregar students em loadAudienceOptions
fetchOptions('/api/v1/school-announcements/audience/students')

// preset button + bloco de checkboxes + resumo + payload
audienceStudentIds: audiencePayload.audienceStudentIds
```

Manter preset exclusivo limpando arrays na troca.

**Step 4: Run test to verify it passes**

Run: `node ace test tests/browser/escola/dashboard_view_mode.spec.ts --match "simplified audience presets"`
Expected: PASS.

**Step 5: Commit**

```bash
git add inertia/pages/escola/comunicados/novo.tsx tests/browser/escola/dashboard_view_mode.spec.ts
git commit -m "feat(comunicados): add specific students audience preset in new announcement form"
```

### Task 6: Cobrir fluxo de publicacao com alunos especificos e regressao rapida

**Files:**

- Modify: `tests/functional/escola/school_announcements_api.spec.ts`

**Step 1: Write the failing test**

Adicionar teste de publicacao por aluno:

```ts
test('publishes with specific student audience and creates recipient notification', async ({
  client,
  assert,
}) => {
  // cria aluno/responsavel
  // create draft com audienceStudentIds
  // publish
  // assert recipient + notification SYSTEM_ANNOUNCEMENT
})
```

Opcional na mesma task: teste de deduplicacao quando aluno aparece por classe + student id.

**Step 2: Run test to verify it fails (if dedup/regression issue exists)**

Run: `node ace test tests/functional/escola/school_announcements_api.spec.ts --match "specific student audience and creates recipient notification"`
Expected: FAIL antes de ajustes finais (ou PASS se comportamento ja estiver correto; nesse caso avancar).

**Step 3: Write minimal implementation**

Ajustar `resolveAudienceStudentIds` se necessario para garantir deduplicacao/consistencia.

**Step 4: Run test to verify it passes**

Run: `node ace test tests/functional/escola/school_announcements_api.spec.ts --match "student audience"`
Expected: PASS.

**Step 5: Commit**

```bash
git add tests/functional/escola/school_announcements_api.spec.ts app/services/school_announcements/school_announcement_audience_service.ts
git commit -m "test(comunicados): cover publish flow for specific student audience"
```

### Task 7: Verificacao final completa

**Files:**

- Modify: none (verification only)
- Test: `tests/functional/escola/school_announcements_api.spec.ts`
- Test: `tests/browser/escola/dashboard_view_mode.spec.ts`

**Step 1: Run targeted functional suite**

Run: `node ace test tests/functional/escola/school_announcements_api.spec.ts`
Expected: PASS.

**Step 2: Run targeted browser suite**

Run: `node ace test tests/browser/escola/dashboard_view_mode.spec.ts`
Expected: PASS.

**Step 3: Smoke-check types/lint (if configured in repo)**

Run: `npm run lint && npm run typecheck`
Expected: PASS (ou comando equivalente do projeto).

**Step 4: Final commit (if verification introduced fixes)**

```bash
git add -A
git commit -m "chore(comunicados): finalize validation for specific student audience"
```

**Step 5: Prepare PR summary**

Incluir:

- novo preset de audiencia por aluno;
- extensao de scope `STUDENT`;
- endpoint de listagem de alunos;
- cobertura funcional/browser.
