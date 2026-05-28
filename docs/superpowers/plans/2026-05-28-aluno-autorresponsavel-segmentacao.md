# Segmentação de UI do Aluno Autorresponsável (#2) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que um aluno autorresponsável (18+, role `STUDENT`) acesse os próprios dados financeiros/documentais/etc. dentro de um layout adulto em `/aluno`, sem gamificação, reusando o stack `/responsavel` via um self-link em `StudentHasResponsible`.

**Architecture:** O aluno autorresponsável vira seu próprio responsável através de uma linha `StudentHasResponsible` onde `studentId === responsibleId` (lembrando: `Student.id === User.id`). Isso desbloqueia a checagem IDOR existente dos controllers `/responsavel` sem alterá-los. O backend expõe `isSelfResponsible`/`segment`/`studentId` no payload do usuário; o frontend adiciona um grupo de navegação "Minha Conta" e páginas `/aluno/*` que renderizam os containers do responsável passando `studentId = user.studentId`.

**Tech Stack:** AdonisJS 6 (Lucid, Japa, Ace commands), Inertia + React, TanStack Query, Tailwind/shadcn.

**Estimativa:** ~1.5-2 dias (a auditoria estimava 1d; o escopo das 5 seções é maior).

**Spec:** `docs/superpowers/specs/2026-05-28-aluno-autorresponsavel-segmentacao-design.md`

---

## Convenções deste plano

- **Testes:** Japa. Todo `*.spec.ts` DEVE conter o bootstrap de transação:
  ```typescript
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })
  ```
  Rodar testes: `node ace test functional --files tests/functional/<path>.spec.ts`
- **Typecheck:** `npm run typecheck` (backend `tsc --noEmit` + frontend). NÃO usar `as`/`any`/`unknown` (regra do projeto).
- **Commits:** sem trailer `Co-Authored-By`. Mensagens em PT-BR, conventional commits.
- **Navegação interna React:** usar `<Link>` do Inertia, nunca `<a href>` cru.

---

## File Structure

**Backend — criar:**
- `app/services/self_responsible_link.ts` — `ensureSelfResponsibleLink(student, trx?)`, idempotente.
- `app/services/self_responsible_context.ts` — `resolveSelfResponsibleContext(user)` → `{ isSelfResponsible, segment, studentId }`.
- `commands/backfill_self_responsible_links.ts` — comando `backfill:self-responsible-links`.
- `app/middleware/require_self_responsible_middleware.ts` — guarda das rotas adultas.
- `app/controllers/pages/aluno/show_aluno_financeiro_page_controller.ts`
- `app/controllers/pages/aluno/show_aluno_documentos_page_controller.ts`
- `app/controllers/pages/aluno/show_aluno_autorizacoes_page_controller.ts`
- `app/controllers/pages/aluno/show_aluno_comunicados_page_controller.ts`
- `app/controllers/pages/aluno/show_aluno_matricula_page_controller.ts`

**Backend — modificar:**
- `app/controllers/online-enrollment/finish_enrollment_controller.ts` — hook do self-link.
- `app/models/dto/user.dto.ts` — campos novos.
- `app/transformers/user_transformer.ts` — campos novos.
- `app/controllers/auth/me.ts` — popular contexto.
- `app/middleware/inertia_middleware.ts` — popular contexto + gate de gamificação.
- `start/kernel.ts` — registrar middleware nomeado.
- `start/routes/pages/aluno.ts` — 5 rotas novas.

**Frontend — criar:**
- `inertia/containers/responsavel/comunicados-content.tsx` — extração do conteúdo de comunicados.
- `inertia/pages/aluno/financeiro.tsx`
- `inertia/pages/aluno/documentos.tsx`
- `inertia/pages/aluno/autorizacoes.tsx`
- `inertia/pages/aluno/comunicados.tsx`
- `inertia/pages/aluno/matricula.tsx`

**Frontend — modificar:**
- `inertia/lib/types.ts` — campos no tipo `UserDto`.
- `inertia/pages/responsavel/comunicados.tsx` — usar o container extraído.
- `inertia/components/layouts/aluno-layout.tsx` — grupo "Minha Conta".

---

## Task 1: Service `ensureSelfResponsibleLink` (idempotente)

**Files:**
- Create: `app/services/self_responsible_link.ts`
- Test: `tests/functional/students/self_responsible_link.spec.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import Role from '#models/role'
import User from '#models/user'
import Student from '#models/student'
import StudentHasResponsible from '#models/student_has_responsible'
import { ensureSelfResponsibleLink } from '#services/self_responsible_link'

async function createSelfResponsibleStudent(seed: string, isSelfResponsible: boolean) {
  const role = await Role.firstOrCreate({ name: 'STUDENT' }, { name: 'STUDENT' })
  const user = await User.create({
    name: `Student ${seed}`,
    slug: `student-${seed}`,
    email: `student-${seed}@example.com`,
    active: true,
    whatsappContact: false,
    grossSalary: 0,
    roleId: role.id,
  })
  return Student.create({
    id: user.id,
    classId: null,
    descountPercentage: 0,
    monthlyPaymentAmount: 0,
    isSelfResponsible,
    paymentDate: null,
    contractId: null,
    canteenLimit: null,
    balance: 0,
    enrollmentStatus: 'REGISTERED',
  })
}

test.group('ensureSelfResponsibleLink', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('cria self-link quando aluno é autorresponsável', async ({ assert }) => {
    const student = await createSelfResponsibleStudent('self-1', true)

    const created = await ensureSelfResponsibleLink(student)

    assert.isTrue(created)
    const link = await StudentHasResponsible.query()
      .where('studentId', student.id)
      .where('responsibleId', student.id)
      .first()
    assert.isNotNull(link)
    assert.isTrue(link!.isPedagogical)
    assert.isTrue(link!.isFinancial)
  })

  test('é idempotente — segunda chamada não duplica', async ({ assert }) => {
    const student = await createSelfResponsibleStudent('self-2', true)

    await ensureSelfResponsibleLink(student)
    const createdAgain = await ensureSelfResponsibleLink(student)

    assert.isFalse(createdAgain)
    const count = await StudentHasResponsible.query()
      .where('studentId', student.id)
      .where('responsibleId', student.id)
      .count('* as total')
    assert.equal(Number(count[0].$extras.total), 1)
  })

  test('não cria link quando aluno não é autorresponsável', async ({ assert }) => {
    const student = await createSelfResponsibleStudent('self-3', false)

    const created = await ensureSelfResponsibleLink(student)

    assert.isFalse(created)
    const link = await StudentHasResponsible.query()
      .where('studentId', student.id)
      .where('responsibleId', student.id)
      .first()
    assert.isNull(link)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node ace test functional --files tests/functional/students/self_responsible_link.spec.ts`
Expected: FAIL — `Cannot find module '#services/self_responsible_link'`.

- [ ] **Step 3: Write the service**

```typescript
// app/services/self_responsible_link.ts
import { v7 as uuidv7 } from 'uuid'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import type Student from '#models/student'
import StudentHasResponsible from '#models/student_has_responsible'

/**
 * Garante que um aluno autorresponsável tenha uma linha StudentHasResponsible
 * apontando pra si mesmo (studentId === responsibleId), desbloqueando a checagem
 * IDOR dos controllers /responsavel. Idempotente. Retorna true se criou a linha.
 */
export async function ensureSelfResponsibleLink(
  student: Student,
  trx?: TransactionClientContract
): Promise<boolean> {
  if (!student.isSelfResponsible) return false

  const existing = await StudentHasResponsible.query({ client: trx })
    .where('studentId', student.id)
    .where('responsibleId', student.id)
    .first()
  if (existing) return false

  await StudentHasResponsible.create(
    {
      id: uuidv7(),
      studentId: student.id,
      responsibleId: student.id,
      isPedagogical: true,
      isFinancial: true,
    },
    { client: trx }
  )
  return true
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node ace test functional --files tests/functional/students/self_responsible_link.spec.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add app/services/self_responsible_link.ts tests/functional/students/self_responsible_link.spec.ts
git commit -m "feat(aluno): service ensureSelfResponsibleLink idempotente"
```

---

## Task 2: Hook do self-link na matrícula online

**Files:**
- Modify: `app/controllers/online-enrollment/finish_enrollment_controller.ts` (após a criação do Student, ~linha 176)
- Test: `tests/functional/online-enrollment/self_responsible_link_hook.spec.ts`

- [ ] **Step 1: Write the failing test**

Este teste chama o service diretamente sobre um Student recém-criado com `isSelfResponsible: true` dentro de uma transação, simulando o efeito do hook (a chamada HTTP completa de matrícula tem muitas dependências; o teste de unidade do service já cobre a lógica — aqui garantimos que o fluxo de criação resulta no link).

```typescript
import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import Role from '#models/role'
import User from '#models/user'
import Student from '#models/student'
import StudentHasResponsible from '#models/student_has_responsible'
import { ensureSelfResponsibleLink } from '#services/self_responsible_link'

test.group('Matrícula online — hook self-link', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('aluno autorresponsável criado na matrícula ganha self-link', async ({ assert }) => {
    const role = await Role.firstOrCreate({ name: 'STUDENT' }, { name: 'STUDENT' })
    const user = await User.create({
      name: 'Aluno Técnico',
      slug: 'aluno-tecnico-hook',
      email: 'aluno-tecnico-hook@example.com',
      active: true,
      whatsappContact: false,
      grossSalary: 0,
      roleId: role.id,
    })
    const student = await Student.create({
      id: user.id,
      classId: null,
      descountPercentage: 0,
      monthlyPaymentAmount: 0,
      isSelfResponsible: true,
      paymentDate: null,
      contractId: null,
      canteenLimit: null,
      balance: 0,
      enrollmentStatus: 'PENDING_DOCUMENT_REVIEW',
    })

    await ensureSelfResponsibleLink(student)

    const link = await StudentHasResponsible.query()
      .where('studentId', student.id)
      .where('responsibleId', student.id)
      .first()
    assert.isNotNull(link)
  })
})
```

- [ ] **Step 2: Run test to verify it fails or passes**

Run: `node ace test functional --files tests/functional/online-enrollment/self_responsible_link_hook.spec.ts`
Expected: PASS (o service já existe da Task 1). Este teste documenta o contrato esperado do hook.

- [ ] **Step 3: Add the hook to the controller**

Em `app/controllers/online-enrollment/finish_enrollment_controller.ts`, localizar o bloco que cria o Student (`Student.create({... isSelfResponsible: data.student.isSelfResponsible ...}, { client: trx })`, ~linha 164-176). Adicionar o import no topo:

```typescript
import { ensureSelfResponsibleLink } from '#services/self_responsible_link'
```

Logo após o bloco onde `student` é criado/resolvido e antes do bloco de criação dos responsáveis (`if (!data.student.isSelfResponsible) { ... }`, ~linha 328), inserir:

```typescript
    // Aluno autorresponsável vira seu próprio responsável (self-link) pra
    // desbloquear acesso aos próprios dados via stack /responsavel.
    if (data.student.isSelfResponsible) {
      await ensureSelfResponsibleLink(student, trx)
    }
```

- [ ] **Step 4: Run typecheck**

Run: `npm run typecheck`
Expected: sem erros novos em `finish_enrollment_controller.ts`.

- [ ] **Step 5: Commit**

```bash
git add app/controllers/online-enrollment/finish_enrollment_controller.ts tests/functional/online-enrollment/self_responsible_link_hook.spec.ts
git commit -m "feat(matricula): cria self-link ao finalizar matrícula de aluno autorresponsável"
```

---

## Task 3: Comando de backfill `backfill:self-responsible-links`

**Files:**
- Create: `commands/backfill_self_responsible_links.ts`
- Test: `tests/functional/commands/backfill_self_responsible_links.spec.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import Role from '#models/role'
import User from '#models/user'
import Student from '#models/student'
import StudentHasResponsible from '#models/student_has_responsible'
import { backfillSelfResponsibleLinks } from '#commands/backfill_self_responsible_links'

async function makeStudent(seed: string, isSelfResponsible: boolean) {
  const role = await Role.firstOrCreate({ name: 'STUDENT' }, { name: 'STUDENT' })
  const user = await User.create({
    name: `Student ${seed}`,
    slug: `student-${seed}`,
    email: `student-${seed}@example.com`,
    active: true,
    whatsappContact: false,
    grossSalary: 0,
    roleId: role.id,
  })
  return Student.create({
    id: user.id,
    classId: null,
    descountPercentage: 0,
    monthlyPaymentAmount: 0,
    isSelfResponsible,
    paymentDate: null,
    contractId: null,
    canteenLimit: null,
    balance: 0,
    enrollmentStatus: 'REGISTERED',
  })
}

test.group('backfill:self-responsible-links', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('cria links pros autorresponsáveis sem vínculo e ignora os demais', async ({ assert }) => {
    const selfA = await makeStudent('bf-a', true)
    const selfB = await makeStudent('bf-b', true)
    await makeStudent('bf-c', false)

    const stats = await backfillSelfResponsibleLinks()

    assert.equal(stats.created, 2)
    for (const s of [selfA, selfB]) {
      const link = await StudentHasResponsible.query()
        .where('studentId', s.id)
        .where('responsibleId', s.id)
        .first()
      assert.isNotNull(link)
    }
  })

  test('é idempotente', async ({ assert }) => {
    await makeStudent('bf-idem', true)
    await backfillSelfResponsibleLinks()
    const stats = await backfillSelfResponsibleLinks()
    assert.equal(stats.created, 0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node ace test functional --files tests/functional/commands/backfill_self_responsible_links.spec.ts`
Expected: FAIL — módulo não encontrado.

- [ ] **Step 3: Write the command + exported logic**

```typescript
// commands/backfill_self_responsible_links.ts
import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import Student from '#models/student'
import { ensureSelfResponsibleLink } from '#services/self_responsible_link'

export interface BackfillStats {
  processed: number
  created: number
}

/** Lógica isolada pra ser testável sem bootar o Ace. */
export async function backfillSelfResponsibleLinks(): Promise<BackfillStats> {
  const stats: BackfillStats = { processed: 0, created: 0 }
  const students = await Student.query().where('isSelfResponsible', true)
  for (const student of students) {
    stats.processed++
    const created = await ensureSelfResponsibleLink(student)
    if (created) stats.created++
  }
  return stats
}

export default class BackfillSelfResponsibleLinks extends BaseCommand {
  static commandName = 'backfill:self-responsible-links'
  static description =
    'Cria self-link em StudentHasResponsible pra alunos autorresponsáveis sem vínculo'
  static options: CommandOptions = { startApp: true }

  async run() {
    const stats = await backfillSelfResponsibleLinks()
    this.logger.info(
      `Backfill concluído: ${stats.processed} autorresponsáveis processados, ${stats.created} self-links criados.`
    )
  }
}
```

Adicionar o alias de import `#commands/*` se ainda não existir em `package.json` (`imports`). Verificar: `grep '"#commands/\*"' package.json`. Se ausente, adicionar:
```json
"#commands/*": "./commands/*.js",
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node ace test functional --files tests/functional/commands/backfill_self_responsible_links.spec.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add commands/backfill_self_responsible_links.ts tests/functional/commands/backfill_self_responsible_links.spec.ts package.json
git commit -m "feat(aluno): comando backfill:self-responsible-links idempotente"
```

---

## Task 4: Service `resolveSelfResponsibleContext`

**Files:**
- Create: `app/services/self_responsible_context.ts`
- Test: `tests/functional/users/self_responsible_context.spec.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import Role from '#models/role'
import User from '#models/user'
import Student from '#models/student'
import { resolveSelfResponsibleContext } from '#services/self_responsible_context'

async function makeStudentUser(seed: string, isSelfResponsible: boolean) {
  const role = await Role.firstOrCreate({ name: 'STUDENT' }, { name: 'STUDENT' })
  const user = await User.create({
    name: `Student ${seed}`,
    slug: `student-${seed}`,
    email: `student-${seed}@example.com`,
    active: true,
    whatsappContact: false,
    grossSalary: 0,
    roleId: role.id,
  })
  await Student.create({
    id: user.id,
    classId: null,
    descountPercentage: 0,
    monthlyPaymentAmount: 0,
    isSelfResponsible,
    paymentDate: null,
    contractId: null,
    canteenLimit: null,
    balance: 0,
    enrollmentStatus: 'REGISTERED',
  })
  await user.load('role')
  return user
}

test.group('resolveSelfResponsibleContext', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('aluno autorresponsável → isSelfResponsible true + studentId', async ({ assert }) => {
    const user = await makeStudentUser('ctx-1', true)
    const ctx = await resolveSelfResponsibleContext(user)
    assert.isTrue(ctx.isSelfResponsible)
    assert.equal(ctx.studentId, user.id)
  })

  test('aluno comum → isSelfResponsible false', async ({ assert }) => {
    const user = await makeStudentUser('ctx-2', false)
    const ctx = await resolveSelfResponsibleContext(user)
    assert.isFalse(ctx.isSelfResponsible)
    assert.equal(ctx.studentId, user.id)
  })

  test('não-aluno → tudo nulo/false', async ({ assert }) => {
    const role = await Role.firstOrCreate(
      { name: 'STUDENT_RESPONSIBLE' },
      { name: 'STUDENT_RESPONSIBLE' }
    )
    const user = await User.create({
      name: 'Resp',
      slug: 'resp-ctx',
      email: 'resp-ctx@example.com',
      active: true,
      whatsappContact: false,
      grossSalary: 0,
      roleId: role.id,
    })
    await user.load('role')
    const ctx = await resolveSelfResponsibleContext(user)
    assert.isFalse(ctx.isSelfResponsible)
    assert.isNull(ctx.studentId)
    assert.isNull(ctx.segment)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node ace test functional --files tests/functional/users/self_responsible_context.spec.ts`
Expected: FAIL — módulo não encontrado.

- [ ] **Step 3: Write the service**

```typescript
// app/services/self_responsible_context.ts
import type User from '#models/user'
import Student from '#models/student'
import StudentHasLevel from '#models/student_has_level'
import type { AcademicPeriodSegment } from '#models/academic_period'

export interface SelfResponsibleContext {
  isSelfResponsible: boolean
  segment: AcademicPeriodSegment | null
  studentId: string | null
}

const EMPTY: SelfResponsibleContext = {
  isSelfResponsible: false,
  segment: null,
  studentId: null,
}

/**
 * Deriva o contexto de aluno autorresponsável a partir do usuário.
 * Requer `user.role` carregado. Retorna vazio pra não-alunos.
 */
export async function resolveSelfResponsibleContext(
  user: User
): Promise<SelfResponsibleContext> {
  if (user.role?.name !== 'STUDENT') return EMPTY

  const student = await Student.find(user.id)
  if (!student) return EMPTY

  const level = await StudentHasLevel.query()
    .where('studentId', student.id)
    .whereNull('deletedAt')
    .orderBy('createdAt', 'desc')
    .preload('academicPeriod')
    .first()

  return {
    isSelfResponsible: student.isSelfResponsible,
    segment: level?.academicPeriod?.segment ?? null,
    studentId: student.id,
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node ace test functional --files tests/functional/users/self_responsible_context.spec.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add app/services/self_responsible_context.ts tests/functional/users/self_responsible_context.spec.ts
git commit -m "feat(aluno): service resolveSelfResponsibleContext"
```

---

## Task 5: Expor `isSelfResponsible`/`segment`/`studentId` no payload do usuário

**Files:**
- Modify: `app/models/dto/user.dto.ts`
- Modify: `app/transformers/user_transformer.ts`
- Modify: `app/controllers/auth/me.ts`
- Modify: `app/middleware/inertia_middleware.ts`
- Modify: `inertia/lib/types.ts`
- Test: `tests/functional/auth/me_self_responsible.spec.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { test } from '@japa/runner'
import '@japa/api-client'
import db from '@adonisjs/lucid/services/db'
import Role from '#models/role'
import User from '#models/user'
import Student from '#models/student'

async function makeSelfResponsibleStudent(seed: string) {
  const role = await Role.firstOrCreate({ name: 'STUDENT' }, { name: 'STUDENT' })
  const user = await User.create({
    name: `Student ${seed}`,
    slug: `student-${seed}`,
    email: `student-${seed}@example.com`,
    active: true,
    whatsappContact: false,
    grossSalary: 0,
    roleId: role.id,
  })
  await Student.create({
    id: user.id,
    classId: null,
    descountPercentage: 0,
    monthlyPaymentAmount: 0,
    isSelfResponsible: true,
    paymentDate: null,
    contractId: null,
    canteenLimit: null,
    balance: 0,
    enrollmentStatus: 'REGISTERED',
  })
  return user
}

test.group('GET /api/v1/me — campos de autorresponsável', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('retorna isSelfResponsible/studentId pro aluno autorresponsável', async ({
    client,
    assert,
  }) => {
    const user = await makeSelfResponsibleStudent('me-1')

    const response = await client.get('/api/v1/me').loginAs(user)

    response.assertStatus(200)
    const body = response.body()
    assert.isTrue(body.isSelfResponsible)
    assert.equal(body.studentId, user.id)
  })
})
```

> Confirmar a rota exata do `me` antes de rodar: `grep -rn "MeController\|'/me'" start/routes`. Ajustar o path do teste se for diferente de `/api/v1/me`.

- [ ] **Step 2: Run test to verify it fails**

Run: `node ace test functional --files tests/functional/auth/me_self_responsible.spec.ts`
Expected: FAIL — `body.isSelfResponsible` é `undefined`.

- [ ] **Step 3: Add fields to `UserDto`**

Em `app/models/dto/user.dto.ts`, adicionar o import e as declarações:

```typescript
import type { AcademicPeriodSegment } from '#models/academic_period'
```

Após `declare school?: SchoolDto` (linha 27):

```typescript
  declare isSelfResponsible: boolean
  declare segment: AcademicPeriodSegment | null
  declare studentId: string | null
```

No construtor, após `this.school = ...` (linha 54), inicializar os defaults (serão sobrescritos por quem tem o contexto):

```typescript
    this.isSelfResponsible = false
    this.segment = null
    this.studentId = null
```

- [ ] **Step 4: Add fields to `UserTransformer`**

Em `app/transformers/user_transformer.ts`, o transformer monta o objeto a partir do model. Como o contexto é assíncrono (queries), o `me.ts` vai injetar os valores no `user` via propriedades extra antes de transformar. Adicionar ao objeto retornado de `toObject()` (após `responsibleAddress`):

```typescript
      isSelfResponsible: (this.resource as User & { $selfResponsible?: boolean }).$selfResponsible ?? false,
      segment: (this.resource as User & { $segment?: AcademicPeriodSegment | null }).$segment ?? null,
      studentId: (this.resource as User & { $studentId?: string | null }).$studentId ?? null,
```

> NOTA: o projeto evita `as`. Alternativa preferida sem cast: estender o `me.ts` pra montar a resposta com spread em vez de depender do transformer pros 3 campos (ver Step 6). Se optar por isso, NÃO alterar o transformer — pular este step e fazer o merge no controller. **Escolha o caminho do Step 6 (merge no controller) como padrão; este Step 4 é fallback.**

- [ ] **Step 5: Add fields to the frontend type**

Em `inertia/lib/types.ts`, localizar o tipo `UserDto` e adicionar:

```typescript
  isSelfResponsible: boolean
  segment:
    | 'KINDERGARTEN'
    | 'ELEMENTARY'
    | 'HIGHSCHOOL'
    | 'TECHNICAL'
    | 'UNIVERSITY'
    | 'OTHER'
    | null
  studentId: string | null
```

> Confirmar o nome exato do tipo: `grep -n "UserDto\|interface User\b" inertia/lib/types.ts`.

- [ ] **Step 6: Wire context into `me.ts` (merge no controller, sem cast)**

Em `app/controllers/auth/me.ts`, importar e mesclar o contexto na resposta:

```typescript
import { resolveSelfResponsibleContext } from '#services/self_responsible_context'
```

Substituir o `return` final por:

```typescript
    const ctx = await resolveSelfResponsibleContext(user)
    const dto = await serialize(UserTransformer.transform(user))
    return response.ok({ ...dto, ...ctx })
```

(Com este caminho, o Step 4 do transformer é desnecessário.)

- [ ] **Step 7: Wire context into `inertia_middleware.ts`**

Em `app/middleware/inertia_middleware.ts`, após construir `userDto = new UserDto(user)` (linha 62), popular os campos:

```typescript
      const ctx = await resolveSelfResponsibleContext(user)
      userDto.isSelfResponsible = ctx.isSelfResponsible
      userDto.segment = ctx.segment
      userDto.studentId = ctx.studentId
```

Adicionar o import no topo:

```typescript
import { resolveSelfResponsibleContext } from '#services/self_responsible_context'
```

- [ ] **Step 8: Run test + typecheck**

Run: `node ace test functional --files tests/functional/auth/me_self_responsible.spec.ts`
Expected: PASS.
Run: `npm run typecheck`
Expected: sem erros novos.

- [ ] **Step 9: Commit**

```bash
git add app/models/dto/user.dto.ts app/controllers/auth/me.ts app/middleware/inertia_middleware.ts inertia/lib/types.ts tests/functional/auth/me_self_responsible.spec.ts
git commit -m "feat(aluno): expõe isSelfResponsible/segment/studentId no payload do usuário"
```

---

## Task 6: Gate de gamificação — defense-in-depth

**Files:**
- Modify: `app/middleware/inertia_middleware.ts:84`
- Test: `tests/functional/aluno/gamification_self_responsible.spec.ts`

- [ ] **Step 1: Write the failing test**

Testa via request a `/aluno` que `gamified` nunca é true pra autorresponsável, mesmo com birthDate de criança. Usa o helper de page-props compartilhado do Inertia (a resposta Inertia traz `props.gamified`).

```typescript
import { test } from '@japa/runner'
import '@japa/api-client'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import Role from '#models/role'
import User from '#models/user'
import Student from '#models/student'

test.group('Gamificação — aluno autorresponsável nunca é gamified', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('autorresponsável com birthDate de criança → gamified false', async ({
    client,
    assert,
  }) => {
    const role = await Role.firstOrCreate({ name: 'STUDENT' }, { name: 'STUDENT' })
    const user = await User.create({
      name: 'Aluno Self',
      slug: 'aluno-self-gam',
      email: 'aluno-self-gam@example.com',
      active: true,
      whatsappContact: false,
      grossSalary: 0,
      roleId: role.id,
      birthDate: DateTime.now().minus({ years: 10 }),
    })
    await Student.create({
      id: user.id,
      classId: null,
      descountPercentage: 0,
      monthlyPaymentAmount: 0,
      isSelfResponsible: true,
      paymentDate: null,
      contractId: null,
      canteenLimit: null,
      balance: 0,
      enrollmentStatus: 'REGISTERED',
    })

    const response = await client
      .get('/aluno')
      .header('X-Inertia', 'true')
      .header('X-Inertia-Version', '1')
      .loginAs(user)

    const body = response.body()
    assert.isFalse(body.props.gamified)
  })
})
```

> Se o assert de `props.gamified` for instável por causa de versão Inertia, fazer fallback: extrair `isGamifiedStudent` + a regra `&& !isSelfResponsible` pra uma função pura testável em `inertia_middleware.ts` e testá-la diretamente.

- [ ] **Step 2: Run test to verify it fails**

Run: `node ace test functional --files tests/functional/aluno/gamification_self_responsible.spec.ts`
Expected: FAIL — `gamified` é `true` (idade 10 ≤ 14).

- [ ] **Step 3: Apply the gate change**

Em `app/middleware/inertia_middleware.ts`, no bloco onde `gamified` é calculado (linha 84):

```typescript
        gamified =
          isGamifiedStudent({
            id: student.id,
            birthDate: bd instanceof DateTime ? bd.toISO() : bd,
            role: userDto.role,
          }) && !student.isSelfResponsible
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node ace test functional --files tests/functional/aluno/gamification_self_responsible.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/middleware/inertia_middleware.ts tests/functional/aluno/gamification_self_responsible.spec.ts
git commit -m "fix(aluno): aluno autorresponsável nunca recebe modo gamified"
```

---

## Task 7: Teste de controle de acesso end-to-end (self-link → 200, outro aluno → 403)

**Files:**
- Test: `tests/functional/aluno/self_responsible_data_access.spec.ts`

- [ ] **Step 1: Write the test**

```typescript
import { test } from '@japa/runner'
import '@japa/api-client'
import db from '@adonisjs/lucid/services/db'
import Role from '#models/role'
import User from '#models/user'
import Student from '#models/student'
import { ensureSelfResponsibleLink } from '#services/self_responsible_link'

async function makeStudent(seed: string, isSelfResponsible: boolean) {
  const role = await Role.firstOrCreate({ name: 'STUDENT' }, { name: 'STUDENT' })
  const user = await User.create({
    name: `Student ${seed}`,
    slug: `student-${seed}`,
    email: `student-${seed}@example.com`,
    active: true,
    whatsappContact: false,
    grossSalary: 0,
    roleId: role.id,
  })
  const student = await Student.create({
    id: user.id,
    classId: null,
    descountPercentage: 0,
    monthlyPaymentAmount: 0,
    isSelfResponsible,
    paymentDate: null,
    contractId: null,
    canteenLimit: null,
    balance: 0,
    enrollmentStatus: 'REGISTERED',
  })
  return { user, student }
}

test.group('Acesso do aluno autorresponsável aos próprios dados', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('com self-link, acessa os próprios pagamentos (200)', async ({ client }) => {
    const { user, student } = await makeStudent('acc-self', true)
    await ensureSelfResponsibleLink(student)

    const response = await client
      .get(`/api/v1/responsavel/students/${student.id}/payments`)
      .loginAs(user)

    response.assertStatus(200)
  })

  test('não acessa dados de OUTRO aluno (403)', async ({ client }) => {
    const { user, student } = await makeStudent('acc-a', true)
    await ensureSelfResponsibleLink(student)
    const other = await makeStudent('acc-b', true)

    const response = await client
      .get(`/api/v1/responsavel/students/${other.student.id}/payments`)
      .loginAs(user)

    response.assertStatus(403)
  })
})
```

- [ ] **Step 2: Run test to verify it passes**

Run: `node ace test functional --files tests/functional/aluno/self_responsible_data_access.spec.ts`
Expected: PASS (2 tests). Valida o coração da arquitetura: o self-link desbloqueia a checagem IDOR e ela continua barrando acesso cruzado.

> Confirmar a rota exata de payments: `grep -n "students/:studentId/payments" start/routes/api/responsavel.ts`. Ajustar o path se necessário.

- [ ] **Step 3: Commit**

```bash
git add tests/functional/aluno/self_responsible_data_access.spec.ts
git commit -m "test(aluno): acesso do autorresponsável aos próprios dados via self-link"
```

---

## Task 8: Middleware `requireSelfResponsible` (guarda das rotas adultas)

**Files:**
- Create: `app/middleware/require_self_responsible_middleware.ts`
- Modify: `start/kernel.ts` (registrar named middleware)
- Test: `tests/functional/aluno/require_self_responsible.spec.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { test } from '@japa/runner'
import '@japa/api-client'
import db from '@adonisjs/lucid/services/db'
import Role from '#models/role'
import User from '#models/user'
import Student from '#models/student'

async function makeStudent(seed: string, isSelfResponsible: boolean) {
  const role = await Role.firstOrCreate({ name: 'STUDENT' }, { name: 'STUDENT' })
  const user = await User.create({
    name: `Student ${seed}`,
    slug: `student-${seed}`,
    email: `student-${seed}@example.com`,
    active: true,
    whatsappContact: false,
    grossSalary: 0,
    roleId: role.id,
  })
  await Student.create({
    id: user.id,
    classId: null,
    descountPercentage: 0,
    monthlyPaymentAmount: 0,
    isSelfResponsible,
    paymentDate: null,
    contractId: null,
    canteenLimit: null,
    balance: 0,
    enrollmentStatus: 'REGISTERED',
  })
  return user
}

test.group('Rota adulta /aluno/financeiro exige autorresponsável', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('aluno comum é redirecionado pra /aluno', async ({ client }) => {
    const user = await makeStudent('guard-common', false)
    const response = await client.get('/aluno/financeiro').loginAs(user).redirects(0)
    response.assertStatus(302)
    response.assertHeader('location', '/aluno')
  })

  test('autorresponsável acessa a página', async ({ client }) => {
    const user = await makeStudent('guard-self', true)
    const response = await client
      .get('/aluno/financeiro')
      .header('X-Inertia', 'true')
      .header('X-Inertia-Version', '1')
      .loginAs(user)
    response.assertStatus(200)
  })
})
```

> Este teste depende das rotas/páginas das Tasks 9 e 11. Pode ser escrito agora mas só passa após elas. Marcar a ordem: implementar o middleware aqui, mas rodar o teste após a Task 11.

- [ ] **Step 2: Write the middleware**

```typescript
// app/middleware/require_self_responsible_middleware.ts
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import Student from '#models/student'

export default class RequireSelfResponsibleMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const user =
      (ctx as HttpContext & { effectiveUser?: HttpContext['auth']['user'] }).effectiveUser ??
      ctx.auth.user

    let allowed = false
    if (user) {
      const student = await Student.find(user.id)
      allowed = student?.isSelfResponsible === true
    }

    if (!allowed) {
      return ctx.response.redirect('/aluno')
    }

    return next()
  }
}
```

> Sobre o cast de `effectiveUser`: seguir o mesmo padrão já usado em `inertia_middleware.ts` (linhas 46-47). Se o projeto tiver uma augmentation de tipo pra `effectiveUser` no `HttpContext`, usá-la e remover o cast.

- [ ] **Step 3: Register the named middleware**

Em `start/kernel.ts`, localizar o objeto `router.named({...})` e adicionar:

```typescript
  requireSelfResponsible: () =>
    import('#middleware/require_self_responsible_middleware'),
```

> Confirmar a estrutura exata: `grep -n "named(" start/kernel.ts` e seguir o formato das entradas vizinhas (ex: `requireRole`).

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: sem erros novos.

- [ ] **Step 5: Commit**

```bash
git add app/middleware/require_self_responsible_middleware.ts start/kernel.ts tests/functional/aluno/require_self_responsible.spec.ts
git commit -m "feat(aluno): middleware requireSelfResponsible pras rotas adultas"
```

---

## Task 9: Page controllers + rotas `/aluno/*` adultas

**Files:**
- Create: `app/controllers/pages/aluno/show_aluno_financeiro_page_controller.ts`
- Create: `app/controllers/pages/aluno/show_aluno_documentos_page_controller.ts`
- Create: `app/controllers/pages/aluno/show_aluno_autorizacoes_page_controller.ts`
- Create: `app/controllers/pages/aluno/show_aluno_comunicados_page_controller.ts`
- Create: `app/controllers/pages/aluno/show_aluno_matricula_page_controller.ts`
- Modify: `start/routes/pages/aluno.ts`

- [ ] **Step 1: Create the four simple page controllers**

Cada um renderiza a página com props mínimas (a página lê `user.studentId` das shared props). Padrão (igual aos controllers existentes em `app/controllers/pages/aluno/`):

```typescript
// app/controllers/pages/aluno/show_aluno_financeiro_page_controller.ts
import type { HttpContext } from '@adonisjs/core/http'

export default class ShowAlunoFinanceiroPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('aluno/financeiro', {})
  }
}
```

Repetir trocando o nome e o template para:
- `show_aluno_documentos_page_controller.ts` → `inertia.render('aluno/documentos', {})`
- `show_aluno_autorizacoes_page_controller.ts` → `inertia.render('aluno/autorizacoes', {})`
- `show_aluno_comunicados_page_controller.ts` → `inertia.render('aluno/comunicados', {})`

- [ ] **Step 2: Create the matricula page controller (resolve o matriculaId)**

```typescript
// app/controllers/pages/aluno/show_aluno_matricula_page_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import StudentHasLevel from '#models/student_has_level'

export default class ShowAlunoMatriculaPageController {
  async handle({ inertia, auth }: HttpContext) {
    const userId = auth.user!.id
    const level = await StudentHasLevel.query()
      .where('studentId', userId)
      .whereNull('deletedAt')
      .orderBy('createdAt', 'desc')
      .first()

    return inertia.render('aluno/matricula', { matriculaId: level?.id ?? null })
  }
}
```

- [ ] **Step 3: Register the routes (guarded)**

Em `start/routes/pages/aluno.ts`, adicionar dentro do grupo (antes do `.prefix('/aluno')`), aplicando o middleware de guarda por rota:

```typescript
      router
        .get('/financeiro', [aluno.ShowAlunoFinanceiroPage])
        .as('financeiro')
        .use(middleware.requireSelfResponsible())
      router
        .get('/documentos', [aluno.ShowAlunoDocumentosPage])
        .as('documentos')
        .use(middleware.requireSelfResponsible())
      router
        .get('/autorizacoes', [aluno.ShowAlunoAutorizacoesPage])
        .as('autorizacoes')
        .use(middleware.requireSelfResponsible())
      router
        .get('/comunicados', [aluno.ShowAlunoComunicadosPage])
        .as('comunicados')
        .use(middleware.requireSelfResponsible())
      router
        .get('/matricula', [aluno.ShowAlunoMatriculaPage])
        .as('matricula')
        .use(middleware.requireSelfResponsible())
```

> Os nomes dos controllers no registry (`aluno.ShowAlunoFinanceiroPage` etc.) são derivados do nome do arquivo pelo gerador `#generated/controllers`. Após criar os arquivos, rodar `node ace` uma vez (ou o comando de geração do projeto) se o registry não atualizar automaticamente. Confirmar com `grep -rn "ShowAlunoFinanceiroPage" .adonisjs/ #generated 2>/dev/null` ou o caminho equivalente do projeto.

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: sem erros novos (as páginas Inertia ainda não existem, mas controllers só referenciam strings de template — OK).

- [ ] **Step 5: Commit**

```bash
git add app/controllers/pages/aluno/ start/routes/pages/aluno.ts
git commit -m "feat(aluno): page controllers + rotas /aluno adultas guardadas"
```

---

## Task 10: Extrair `ComunicadosContent` num container compartilhado

**Files:**
- Create: `inertia/containers/responsavel/comunicados-content.tsx`
- Modify: `inertia/pages/responsavel/comunicados.tsx`

- [ ] **Step 1: Extract the content component**

Mover a função `ComunicadosContent` (e os tipos/helpers locais que ela usa: `AnnouncementItem`, `AnnouncementResponse`, `listComunicados`, e o JSX de preview/acknowledge) de `inertia/pages/responsavel/comunicados.tsx` para um novo arquivo, exportando-a:

```typescript
// inertia/containers/responsavel/comunicados-content.tsx
// (cole aqui o corpo de ComunicadosContent + tipos/helpers locais que estavam na página)
export function ComunicadosContent() {
  // ... corpo idêntico ao que estava na página ...
}
```

Manter o fetch em `/api/v1/responsavel/comunicados?limit=20` (escopo do usuário logado — funciona pro autorresponsável via self-link).

- [ ] **Step 2: Update the responsavel page to use the container**

Em `inertia/pages/responsavel/comunicados.tsx`, remover o código movido e importar:

```typescript
import { ComunicadosContent } from '../../containers/responsavel/comunicados-content'
```

A página passa a só renderizar `<ResponsavelLayout>...<ComunicadosContent />...</ResponsavelLayout>`.

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: sem erros novos no frontend relacionados a comunicados.

- [ ] **Step 4: Commit**

```bash
git add inertia/containers/responsavel/comunicados-content.tsx inertia/pages/responsavel/comunicados.tsx
git commit -m "refactor(comunicados): extrai ComunicadosContent pra container reutilizável"
```

---

## Task 11: Páginas `/aluno/*` adultas (renderizam containers do responsável)

**Files:**
- Create: `inertia/pages/aluno/financeiro.tsx`
- Create: `inertia/pages/aluno/documentos.tsx`
- Create: `inertia/pages/aluno/autorizacoes.tsx`
- Create: `inertia/pages/aluno/comunicados.tsx`
- Create: `inertia/pages/aluno/matricula.tsx`

> Todas usam `AlunoLayout` e leem `user` via `useAuthUser()` (hook já usado em `aluno-layout.tsx`). `studentId === user.studentId` (== user.id). Não usar `useSelectedStudent()` — aqui há um único aluno (o próprio).

- [ ] **Step 1: Financeiro**

```tsx
// inertia/pages/aluno/financeiro.tsx
import { Head } from '@inertiajs/react'
import { AlunoLayout } from '../../components/layouts/aluno-layout'
import { useAuthUser } from '../../stores/auth_store'
import { StudentPaymentsContainer } from '../../containers/responsavel/student-payments-container'

export default function AlunoFinanceiroPage() {
  const user = useAuthUser()
  return (
    <AlunoLayout>
      <Head title="Financeiro" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground">Suas mensalidades e faturas</p>
        </div>
        {user?.studentId ? (
          <StudentPaymentsContainer studentId={user.studentId} />
        ) : null}
      </div>
    </AlunoLayout>
  )
}
```

> Confirmar o import correto do layout e do hook: `grep -rn "useAuthUser\|export function AlunoLayout\|export default" inertia/components/layouts/aluno-layout.tsx`. Ajustar named vs default import conforme o arquivo. (No `aluno-layout.tsx` atual, `useAuthUser` vem de `../../stores/auth_store`.)

- [ ] **Step 2: Documentos**

```tsx
// inertia/pages/aluno/documentos.tsx
import { Head } from '@inertiajs/react'
import { AlunoLayout } from '../../components/layouts/aluno-layout'
import { useAuthUser } from '../../stores/auth_store'
import { StudentDocumentsContainer } from '../../containers/responsavel/student-documents-container'

export default function AlunoDocumentosPage() {
  const user = useAuthUser()
  return (
    <AlunoLayout>
      <Head title="Documentos" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documentos</h1>
          <p className="text-muted-foreground">Seus documentos de matrícula</p>
        </div>
        {user?.studentId ? (
          <StudentDocumentsContainer studentId={user.studentId} studentName={user.name} />
        ) : null}
      </div>
    </AlunoLayout>
  )
}
```

- [ ] **Step 3: Autorizações**

```tsx
// inertia/pages/aluno/autorizacoes.tsx
import { Head } from '@inertiajs/react'
import { useState } from 'react'
import { Shield, Clock, History } from 'lucide-react'
import { AlunoLayout } from '../../components/layouts/aluno-layout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { PendingConsentsContainer } from '../../containers/parental-consents/pending-consents-container'
import { ConsentHistoryContainer } from '../../containers/parental-consents/consent-history-container'

export default function AlunoAutorizacoesPage() {
  const [historyPage, setHistoryPage] = useState(1)
  return (
    <AlunoLayout>
      <Head title="Autorizações" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Autorizações
          </h1>
          <p className="text-muted-foreground">Autorize sua participação em eventos escolares</p>
        </div>
        <Tabs defaultValue="pending">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="pending" className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Pendentes
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center">
              <History className="h-4 w-4 mr-2" />
              Histórico
            </TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="mt-6">
            <PendingConsentsContainer />
          </TabsContent>
          <TabsContent value="history" className="mt-6">
            <ConsentHistoryContainer page={historyPage} onPageChange={setHistoryPage} />
          </TabsContent>
        </Tabs>
      </div>
    </AlunoLayout>
  )
}
```

> Confirmar a assinatura de props de `ConsentHistoryContainer`: `grep -n "ConsentHistoryContainerProps\|export function ConsentHistoryContainer" inertia/containers/parental-consents/consent-history-container.tsx`. Ajustar props (`page`/`onPageChange`) conforme a real; se não tiver props de paginação, renderizar `<ConsentHistoryContainer />` e remover o `useState`.

- [ ] **Step 4: Comunicados**

```tsx
// inertia/pages/aluno/comunicados.tsx
import { Head } from '@inertiajs/react'
import { AlunoLayout } from '../../components/layouts/aluno-layout'
import { ComunicadosContent } from '../../containers/responsavel/comunicados-content'

export default function AlunoComunicadosPage() {
  return (
    <AlunoLayout>
      <Head title="Comunicados" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Comunicados</h1>
          <p className="text-muted-foreground">Comunicados da escola</p>
        </div>
        <ComunicadosContent />
      </div>
    </AlunoLayout>
  )
}
```

- [ ] **Step 5: Matrícula**

```tsx
// inertia/pages/aluno/matricula.tsx
import { Head } from '@inertiajs/react'
import { AlunoLayout } from '../../components/layouts/aluno-layout'
import { MatriculaAxesContainer } from '../../containers/responsavel/matricula-axes-container'

export default function AlunoMatriculaPage({ matriculaId }: { matriculaId: string | null }) {
  return (
    <AlunoLayout>
      <Head title="Matrícula" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Minha Matrícula</h1>
          <p className="text-muted-foreground">Status dos eixos da sua matrícula</p>
        </div>
        {matriculaId ? (
          <MatriculaAxesContainer matriculaId={matriculaId} />
        ) : (
          <p className="text-sm text-muted-foreground">Nenhuma matrícula ativa encontrada.</p>
        )}
      </div>
    </AlunoLayout>
  )
}
```

- [ ] **Step 6: Typecheck + run the guard test (Task 8)**

Run: `npm run typecheck`
Expected: sem erros novos.
Run: `node ace test functional --files tests/functional/aluno/require_self_responsible.spec.ts`
Expected: PASS (agora que rotas+páginas existem).

- [ ] **Step 7: Commit**

```bash
git add inertia/pages/aluno/financeiro.tsx inertia/pages/aluno/documentos.tsx inertia/pages/aluno/autorizacoes.tsx inertia/pages/aluno/comunicados.tsx inertia/pages/aluno/matricula.tsx
git commit -m "feat(aluno): páginas adultas /aluno reusando containers do responsável"
```

---

## Task 12: Grupo de navegação "Minha Conta" no aluno-layout

**Files:**
- Modify: `inertia/components/layouts/aluno-layout.tsx`

- [ ] **Step 1: Add the self-responsible nav array**

Em `inertia/components/layouts/aluno-layout.tsx`, após a definição de `gamifiedNavigation` (linha 91), adicionar (importando os ícones necessários de `lucide-react` no topo — `Wallet`, `FileText`, `ShieldCheck`, `GraduationCap`, `Megaphone`):

```typescript
const selfResponsibleNavigation: NavItem[] = [
  { title: 'Financeiro', route: 'web.aluno.financeiro', href: '/aluno/financeiro', icon: Wallet },
  { title: 'Documentos', route: 'web.aluno.documentos', href: '/aluno/documentos', icon: FileText },
  {
    title: 'Autorizações',
    route: 'web.aluno.autorizacoes',
    href: '/aluno/autorizacoes',
    icon: ShieldCheck,
  },
  { title: 'Matrícula', route: 'web.aluno.matricula', href: '/aluno/matricula', icon: GraduationCap },
  {
    title: 'Comunicados',
    route: 'web.aluno.comunicados',
    href: '/aluno/comunicados',
    icon: Megaphone,
  },
]
```

> Confirmar que os nomes de rota (`web.aluno.financeiro` etc.) batem com o registry gerado após a Task 9: `grep -rn "web.aluno.financeiro" inertia/@generated 2>/dev/null` (ou o caminho do registry do projeto). Se o prefixo for diferente, ajustar. As rotas só são usadas pelo tipo `NavItem`; o `href` é o que de fato navega.

- [ ] **Step 2: Render the group conditionally**

Em `AppSidebar`, após o `<SidebarGroup>` "Menu" existente (linha ~158), adicionar — usando `user.isSelfResponsible` (de `useAuthUser()`, já disponível como `user` na linha 105):

```tsx
            {user?.isSelfResponsible && !gamified ? (
              <SidebarGroup>
                <SidebarGroupLabel>Minha Conta</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {selfResponsibleNavigation.map((item) => {
                      const isActive = pathname === item.href
                      return (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                            <Link href={item.href}>
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ) : null}
```

> O `<Link>` aqui é o do Inertia já importado no arquivo. Manter o padrão de import existente.

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: sem erros novos.

- [ ] **Step 4: Commit**

```bash
git add inertia/components/layouts/aluno-layout.tsx
git commit -m "feat(aluno): grupo de navegação 'Minha Conta' pro aluno autorresponsável"
```

---

## Task 13: Verificação final

- [ ] **Step 1: Rodar a suíte de testes nova**

Run:
```bash
node ace test functional --files tests/functional/students/self_responsible_link.spec.ts --files tests/functional/online-enrollment/self_responsible_link_hook.spec.ts --files tests/functional/commands/backfill_self_responsible_links.spec.ts --files tests/functional/users/self_responsible_context.spec.ts --files tests/functional/auth/me_self_responsible.spec.ts --files tests/functional/aluno/gamification_self_responsible.spec.ts --files tests/functional/aluno/self_responsible_data_access.spec.ts --files tests/functional/aluno/require_self_responsible.spec.ts
```
Expected: todos PASS.

- [ ] **Step 2: Typecheck completo**

Run: `npm run typecheck`
Expected: sem erros novos no nosso código (erros pré-existentes documentados ficam).

- [ ] **Step 3: Rodar o backfill em dev**

Run: `node ace backfill:self-responsible-links`
Expected: log "Backfill concluído: N processados, M criados.".

- [ ] **Step 4: Verificação manual (Chrome MCP)**

- Criar/usar um aluno autorresponsável de teste (Student.isSelfResponsible=true, 18+, segmento TECHNICAL/UNIVERSITY). Logar.
- Confirmar: sidebar não-gamified com grupo "Minha Conta"; Financeiro/Documentos/Autorizações/Matrícula/Comunicados carregam dados próprios (sem 403); nenhuma estética gamified.
- Confirmar: aluno comum (≤14) segue gamified e SEM "Minha Conta"; aluno 15+ não-autorresponsável: sem "Minha Conta".
- Confirmar: navegar direto pra `/aluno/financeiro` como aluno comum redireciona pra `/aluno`.

- [ ] **Step 5: Marcar #2 na auditoria**

Em `AUDITORIA-2026-05.md`, marcar o item #2 como `[x]` e adicionar nota "Feito" com resumo da entrega + commits, no padrão dos itens já concluídos. Atualizar a linha "Última atualização".

```bash
git add AUDITORIA-2026-05.md
git commit -m "docs(auditoria): marca #2 (segmentação do aluno autorresponsável) como concluída"
```

---

## Self-Review (preenchido pelo autor do plano)

**Spec coverage:**
- Helper `resolveSelfResponsibleContext` em me.ts + inertia_middleware → Tasks 4, 5. ✓
- Expor isSelfResponsible/segment/studentId (DTO, transformer/controller, frontend types) → Task 5. ✓
- Gate `&& !isSelfResponsible` → Task 6. ✓
- Self-link: hook na matrícula + backfill idempotente → Tasks 1, 2, 3. ✓
- Grupo "Minha Conta" + 5 páginas reusando containers → Tasks 9, 10, 11, 12. ✓
- Verificações da spec (backfill idempotente, 200 vs 403, gamified false, aluno comum sem grupo, sem acesso cruzado) → Tasks 1, 6, 7, 13. ✓
- Fora de escopo (sem role nova, sem tocar rotas /responsavel, sem threshold/teen) → respeitado. ✓

**Placeholder scan:** sem "TBD/TODO". As notas com `>` são instruções de verificação concretas (confirmar nome/rota), não placeholders de código.

**Type consistency:** `ensureSelfResponsibleLink` retorna `boolean` (usado em backfill); `resolveSelfResponsibleContext` retorna `SelfResponsibleContext` com os mesmos 3 campos do DTO/types; nomes de rota `web.aluno.*` consistentes entre Task 9 e Task 12.

**Riscos conhecidos / verificações deixadas ao executor:**
- Rota exata do `me` e dos endpoints `/responsavel/*` (confirmar via grep antes de rodar os testes).
- Nome dos controllers no registry `#generated/controllers` e nomes de rota no registry do frontend (regeneração após criar arquivos).
- Assinatura real de `ConsentHistoryContainer` (props de paginação).
- Caminho de cast de `effectiveUser` — preferir augmentation de tipo se existir, evitando `as`.
