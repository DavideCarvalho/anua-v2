# Escola Alunos Tests (Fase 1) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add functional test coverage for `/escola/administrativo/alunos` access control and `GET /api/v1/students` contract/authorization/filter behavior.

**Architecture:** Keep phase 1 fully backend-functional using Japa + Adonis test client, without browser/e2e tooling. Build coverage in one spec file with small local fixtures and global DB transaction per test to keep deterministic isolation. Follow strict TDD per scenario: fail first, minimal implementation (test setup only), pass, then commit.

**Tech Stack:** AdonisJS 7, Japa runner, @japa/api-client, Lucid ORM, TypeScript.

---

### Task 1: Create spec scaffold and page auth guards

**Files:**

- Create: `tests/functional/escola/alunos_page_and_students_api.spec.ts`
- Modify: `tests/functional/escola/alunos_page_and_students_api.spec.ts`
- Test: `tests/functional/escola/alunos_page_and_students_api.spec.ts`

**Step 1: Write the failing test**

```ts
import { test } from '@japa/runner'

test.group('Escola alunos page and students api', () => {
  test('redirects /escola/administrativo/alunos to /login when unauthenticated', async ({
    client,
  }) => {
    const response = await client.get('/escola/administrativo/alunos')
    response.assertStatus(302)
    response.assertHeader('location', '/login')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test functional --files tests/functional/escola/alunos_page_and_students_api.spec.ts`
Expected: FAIL because file/suite does not exist yet.

**Step 3: Write minimal implementation**

Create the file and test exactly as above.

**Step 4: Run test to verify it passes**

Run: `node ace test functional --files tests/functional/escola/alunos_page_and_students_api.spec.ts`
Expected: PASS with 1 passing test.

**Step 5: Commit**

```bash
git add tests/functional/escola/alunos_page_and_students_api.spec.ts
git commit -m "test(escola-alunos): add unauthenticated page access guard coverage"
```

### Task 2: Add API auth guard and DB transaction isolation

**Files:**

- Modify: `tests/functional/escola/alunos_page_and_students_api.spec.ts`
- Test: `tests/functional/escola/alunos_page_and_students_api.spec.ts`

**Step 1: Write the failing test**

```ts
test('returns 401 for GET /api/v1/students when unauthenticated', async ({ client }) => {
  const response = await client.get('/api/v1/students')
  response.assertStatus(401)
})
```

Also add group setup/teardown with global transaction:

```ts
group.each.setup(async () => {
  await db.beginGlobalTransaction()
  return async () => {
    await db.rollbackGlobalTransaction()
  }
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test functional --files tests/functional/escola/alunos_page_and_students_api.spec.ts`
Expected: FAIL before auth expectation/setup is correctly in place.

**Step 3: Write minimal implementation**

Import `db` from `@adonisjs/lucid/services/db`, add test and transaction hooks.

**Step 4: Run test to verify it passes**

Run: `node ace test functional --files tests/functional/escola/alunos_page_and_students_api.spec.ts`
Expected: PASS for page redirect + API 401.

**Step 5: Commit**

```bash
git add tests/functional/escola/alunos_page_and_students_api.spec.ts
git commit -m "test(escola-alunos): cover API authentication guard"
```

### Task 3: Add page access scenarios (with school, without school, teacher)

**Files:**

- Modify: `tests/functional/escola/alunos_page_and_students_api.spec.ts`
- Test: `tests/functional/escola/alunos_page_and_students_api.spec.ts`

**Step 1: Write the failing tests**

```ts
test('allows authenticated user with school access', async ({ client }) => {
  const { user } = await createAuthenticatedSchoolUser(client)
  const response = await client.get('/escola/administrativo/alunos')
  response.assertStatus(200)
})

test('redirects authenticated user without schools to /dashboard', async ({ client }) => {
  await createAuthenticatedUserWithoutSchool(client)
  const response = await client.get('/escola/administrativo/alunos')
  response.assertStatus(302)
  response.assertHeader('location', '/dashboard')
})

test('redirects SCHOOL_TEACHER from admin alunos page to pedagogico/turmas', async ({ client }) => {
  await createAuthenticatedTeacherWithSchool(client)
  const response = await client.get('/escola/administrativo/alunos')
  response.assertStatus(302)
  response.assertHeader('location', '/escola/pedagogico/turmas')
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test functional --files tests/functional/escola/alunos_page_and_students_api.spec.ts`
Expected: FAIL because helper builders/fixtures are not implemented.

**Step 3: Write minimal implementation**

Add local helpers in spec to create minimal Role/User/School records and authenticate via Japa client session cookie:

- `createRole(name: string)`
- `createSchool()`
- `createUserWithRole({ roleName, schoolId? })`
- helper that seeds `UserHasSchool` when needed
- helper to set authenticated client context used by existing auth middleware.

**Step 4: Run test to verify it passes**

Run: `node ace test functional --files tests/functional/escola/alunos_page_and_students_api.spec.ts`
Expected: PASS for all page access scenarios.

**Step 5: Commit**

```bash
git add tests/functional/escola/alunos_page_and_students_api.spec.ts
git commit -m "test(escola-alunos): validate page middleware access scenarios"
```

### Task 4: Add students API happy path and pagination contract

**Files:**

- Modify: `tests/functional/escola/alunos_page_and_students_api.spec.ts`
- Test: `tests/functional/escola/alunos_page_and_students_api.spec.ts`

**Step 1: Write the failing tests**

```ts
test('returns paginated students payload for authenticated user', async ({ client, assert }) => {
  const ctx = await createAuthenticatedAdminLikeUser(client)
  await seedStudentForSchool(ctx.school.id, { name: 'Aluno Um' })
  await seedStudentForSchool(ctx.school.id, { name: 'Aluno Dois' })

  const response = await client.get('/api/v1/students').qs({ page: 1, limit: 1 })

  response.assertStatus(200)
  const body = response.body()
  assert.isArray(body.data)
  assert.exists(body.metadata)
  assert.equal(body.metadata.perPage, 1)
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test functional --files tests/functional/escola/alunos_page_and_students_api.spec.ts`
Expected: FAIL because student seed helper is missing or payload assertions do not match yet.

**Step 3: Write minimal implementation**

Add minimal helper to persist Student + User relations needed by `IndexStudentsController` query and preload.

**Step 4: Run test to verify it passes**

Run: `node ace test functional --files tests/functional/escola/alunos_page_and_students_api.spec.ts`
Expected: PASS with metadata contract validated.

**Step 5: Commit**

```bash
git add tests/functional/escola/alunos_page_and_students_api.spec.ts
git commit -m "test(escola-alunos): add students API pagination contract coverage"
```

### Task 5: Add school scope and safety fallback tests

**Files:**

- Modify: `tests/functional/escola/alunos_page_and_students_api.spec.ts`
- Test: `tests/functional/escola/alunos_page_and_students_api.spec.ts`

**Step 1: Write the failing tests**

```ts
test('returns only students from selected school ids', async ({ client, assert }) => {
  const ctx = await createAuthenticatedUserWithTwoSchools(client)
  await seedStudentForSchool(ctx.schoolA.id, { name: 'Aluno A' })
  await seedStudentForSchool(ctx.schoolB.id, { name: 'Aluno B' })

  await setSelectedSchoolIdsInSession(client, [ctx.schoolA.id])
  const response = await client.get('/api/v1/students')

  response.assertStatus(200)
  const names = response.body().data.map((s: any) => s.user?.name ?? s.name)
  assert.deepEqual(names, ['Aluno A'])
})

test('returns empty data for non-admin when selectedSchoolIds is empty', async ({
  client,
  assert,
}) => {
  await createAuthenticatedSchoolUser(client)
  await setSelectedSchoolIdsInSession(client, [])

  const response = await client.get('/api/v1/students')
  response.assertStatus(200)
  assert.lengthOf(response.body().data, 0)
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test functional --files tests/functional/escola/alunos_page_and_students_api.spec.ts`
Expected: FAIL until session selection and multi-school setup are correct.

**Step 3: Write minimal implementation**

Add helper utilities in test for:

- multi-school user setup (`UserHasSchool` entries),
- selected school ids session override,
- deterministic student creation per school.

**Step 4: Run test to verify it passes**

Run: `node ace test functional --files tests/functional/escola/alunos_page_and_students_api.spec.ts`
Expected: PASS with strict scope isolation.

**Step 5: Commit**

```bash
git add tests/functional/escola/alunos_page_and_students_api.spec.ts
git commit -m "test(escola-alunos): enforce selected school scope in students index"
```

### Task 6: Add filter coverage and validator limit guard

**Files:**

- Modify: `tests/functional/escola/alunos_page_and_students_api.spec.ts`
- Test: `tests/functional/escola/alunos_page_and_students_api.spec.ts`

**Step 1: Write the failing tests**

```ts
test('filters students by search', async ({ client, assert }) => {
  const ctx = await createAuthenticatedSchoolUser(client)
  await seedStudentForSchool(ctx.school.id, { name: 'Maria Clara', email: 'maria@example.com' })
  await seedStudentForSchool(ctx.school.id, { name: 'Joao Pedro', email: 'joao@example.com' })

  const response = await client.get('/api/v1/students').qs({ search: 'Maria' })
  response.assertStatus(200)
  assert.lengthOf(response.body().data, 1)
})

test('filters by classId', async ({ client, assert }) => {
  // seed two students in different classes, query with one classId, assert one result
})

test('filters by academicPeriodId and courseId', async ({ client, assert }) => {
  // seed relational chain required by controller (levels -> levelAssignedToCourseAcademicPeriod -> courseHasAcademicPeriod)
  // query with academicPeriodId/courseId and assert filtered list
})

test('returns validation error when limit is greater than 100', async ({ client }) => {
  const response = await client.get('/api/v1/students').qs({ limit: 101 })
  response.assertStatus(422)
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test functional --files tests/functional/escola/alunos_page_and_students_api.spec.ts`
Expected: FAIL before relational fixture graph and filter setup are complete.

**Step 3: Write minimal implementation**

Add only test-side fixture helpers needed to create:

- classes and student.class relation,
- academic period/course/level linkage consumed by `whereHas` in `IndexStudentsController`,
- searchable user fields.

Keep helpers private to this spec for phase 1.

**Step 4: Run test to verify it passes**

Run: `node ace test functional --files tests/functional/escola/alunos_page_and_students_api.spec.ts`
Expected: PASS for all filter + validation scenarios.

**Step 5: Commit**

```bash
git add tests/functional/escola/alunos_page_and_students_api.spec.ts
git commit -m "test(escola-alunos): cover students index filters and validator bounds"
```

### Task 7: Final verification and quality gate

**Files:**

- Test: `tests/functional/escola/alunos_page_and_students_api.spec.ts`

**Step 1: Run focused functional suite**

Run: `node ace test functional --files tests/functional/escola/alunos_page_and_students_api.spec.ts`
Expected: PASS all tests.

**Step 2: Run full functional suite sanity check**

Run: `node ace test functional`
Expected: PASS or known unrelated failures documented.

**Step 3: If unrelated failures exist, document and isolate**

Record exact failing suites and confirm new file remains green when run in isolation.

**Step 4: Commit verification artifact (if needed)**

Only if you added notes/docs for failures.

```bash
git add <notes-if-created>
git commit -m "chore(test): document unrelated functional suite failures"
```
