# Comunicados Ciencia Functional Tests Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add functional API coverage for responsavel comunicado listing, details, pending acknowledgements, and acknowledge action without relying on unit tests.

**Architecture:** Create a single functional spec that seeds minimal relational data (role, school, users, announcement, recipient) directly via Lucid models and validates API behavior through authenticated requests. Focus on response status and contract fields that drive the UI acknowledgement experience. Keep fixtures local to the spec to avoid hidden dependencies.

**Tech Stack:** AdonisJS v6, Japa runner, @japa/api-client, Lucid ORM, Luxon.

---

### Task 1: Create shared test seed helpers inside spec

**Files:**

- Create: `tests/functional/responsavel/comunicados_api.spec.ts`
- Reference: `tests/functional/pages/dashboard_page.spec.ts`
- Reference: `tests/helpers/escola_auth.ts`

**Step 1: Write the failing test scaffold**

```ts
import { test } from '@japa/runner'

test.group('Responsavel comunicados API', () => {
  test('placeholder', async ({ assert }) => {
    assert.fail('pending implementation')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test --files tests/functional/responsavel/comunicados_api.spec.ts`
Expected: FAIL with placeholder assertion.

**Step 3: Write minimal setup implementation**

```ts
async function createResponsavelAuthUser() {
  const role = await Role.create({ name: 'STUDENT_RESPONSIBLE' })
  const school = await School.create({ name: 'Test School', slug: `test-school-${Date.now()}` })
  const user = await User.create({ ... })
  return { role, school, user }
}

async function createPublishedAnnouncementFor(userId: string, schoolId: string, overrides = {}) {
  const announcement = await SchoolAnnouncement.create({ ... })
  const recipient = await SchoolAnnouncementRecipient.create({ ... })
  return { announcement, recipient }
}
```

**Step 4: Run test to verify base setup passes**

Run: `node ace test --files tests/functional/responsavel/comunicados_api.spec.ts`
Expected: PASS for setup smoke test (after replacing placeholder).

**Step 5: Commit**

```bash
git add tests/functional/responsavel/comunicados_api.spec.ts
git commit -m "test: add responsavel comunicados functional fixtures"
```

### Task 2: Add list and details endpoint coverage

**Files:**

- Modify: `tests/functional/responsavel/comunicados_api.spec.ts`
- Reference: `start/routes/api/responsavel.ts`
- Reference: `app/controllers/responsavel/list_comunicados_controller.ts`
- Reference: `app/controllers/responsavel/show_comunicado_controller.ts`

**Step 1: Write failing list/details tests**

```ts
test('returns only published comunicados for the authenticated responsible', async ({ client }) => {
  // seed one recipient for logged user and one for other user
  const response = await client.get('/api/v1/responsavel/comunicados').loginAs(user)
  response.assertStatus(200)
  response.assertBodyContains({ data: [{ id: expectedId }] })
})

test('returns comunicado details with acknowledgementStatus', async ({ client }) => {
  const response = await client
    .get(`/api/v1/responsavel/comunicados/${announcement.id}`)
    .loginAs(user)
  response.assertStatus(200)
  response.assertBodyContains({ id: announcement.id, acknowledgementStatus: 'PENDING_ACK' })
})
```

**Step 2: Run tests to verify they fail first**

Run: `node ace test --files tests/functional/responsavel/comunicados_api.spec.ts`
Expected: FAIL until assertions align with real payload contract.

**Step 3: Implement minimal assertions and data setup to satisfy real contract**

```ts
// assert on stable fields only:
// response.body().data length, announcement id, status, acknowledgementStatus
```

**Step 4: Run tests to verify pass**

Run: `node ace test --files tests/functional/responsavel/comunicados_api.spec.ts`
Expected: PASS for list/details scenarios.

**Step 5: Commit**

```bash
git add tests/functional/responsavel/comunicados_api.spec.ts
git commit -m "test: cover responsavel comunicados listing and details"
```

### Task 3: Add pending-ack and acknowledge action coverage

**Files:**

- Modify: `tests/functional/responsavel/comunicados_api.spec.ts`
- Reference: `app/controllers/responsavel/list_pending_acknowledgements_controller.ts`
- Reference: `app/controllers/responsavel/acknowledge_comunicado_controller.ts`
- Reference: `app/services/school_announcements/school_announcement_acknowledgement_service.ts`

**Step 1: Write failing tests for pending and acknowledge**

```ts
test('lists only pending acknowledgements that are not expired', async ({ client }) => {
  const response = await client.get('/api/v1/responsavel/comunicados/pending-ack').loginAs(user)
  response.assertStatus(200)
  // contains pending, excludes expired and already acknowledged
})

test('acknowledges a required comunicado and persists acknowledgedAt', async ({
  client,
  assert,
}) => {
  const ackResponse = await client
    .post(`/api/v1/responsavel/comunicados/${announcement.id}/acknowledge`)
    .loginAs(user)
  ackResponse.assertStatus(200)

  const recipient = await SchoolAnnouncementRecipient.query()
    .where('announcementId', announcement.id)
    .where('responsibleId', user.id)
    .firstOrFail()
  assert.isNotNull(recipient.acknowledgedAt)
})
```

**Step 2: Run tests to verify they fail first**

Run: `node ace test --files tests/functional/responsavel/comunicados_api.spec.ts`
Expected: FAIL until fixtures cover pending/expired/acknowledged combinations.

**Step 3: Implement minimal fixture variants and stable assertions**

```ts
// seed announcements with:
// - requiresAcknowledgement=true dueAt future, acknowledgedAt null (pending)
// - requiresAcknowledgement=true dueAt past, acknowledgedAt null (expired)
// - requiresAcknowledgement=true dueAt future, acknowledgedAt now (already acknowledged)
```

**Step 4: Run tests to verify pass**

Run: `node ace test --files tests/functional/responsavel/comunicados_api.spec.ts`
Expected: PASS for pending-ack and acknowledge scenarios.

**Step 5: Commit**

```bash
git add tests/functional/responsavel/comunicados_api.spec.ts
git commit -m "test: cover comunicado acknowledgement lifecycle endpoints"
```

### Task 4: Remove unit-suite leftovers and verify functional-only direction

**Files:**

- Delete: `tests/unit/middleware/require_school_middleware.spec.ts` (already removed in working tree)
- Verify: `adonisrc.ts`

**Step 1: Write/adjust failing expectation if needed**

```ts
// N/A code step; policy verification task
```

**Step 2: Run verification command**

Run: `node ace test --files tests/functional/pages/dashboard_page.spec.ts`
Expected: PASS (ensures baseline functional suite still executes).

**Step 3: Verify no unit specs remain**

Run: `glob tests/unit/**/*.spec.ts`
Expected: no files found.

**Step 4: Commit cleanup if not yet tracked**

```bash
git add tests/unit/middleware/require_school_middleware.spec.ts adonisrc.ts
git commit -m "test: enforce functional-only test suite"
```

### Task 5: Final verification sweep

**Files:**

- Verify: `tests/functional/responsavel/comunicados_api.spec.ts`
- Verify: `tests/functional/pages/dashboard_page.spec.ts`

**Step 1: Run new spec**

Run: `node ace test --files tests/functional/responsavel/comunicados_api.spec.ts`
Expected: all tests pass.

**Step 2: Run related baseline spec**

Run: `node ace test --files tests/functional/pages/dashboard_page.spec.ts`
Expected: all tests pass.

**Step 3: Report verification evidence**

Document exact command outputs in the task report (test counts and pass/fail).

**Step 4: Commit final test work**

```bash
git add tests/functional/responsavel/comunicados_api.spec.ts
git commit -m "test: add functional coverage for comunicados and acknowledgement flow"
```
