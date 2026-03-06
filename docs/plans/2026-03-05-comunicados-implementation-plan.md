# Comunicados da Escola Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a dedicated school announcements module (draft -> publish) and keep notifications as delivery alerts for responsaveis.

**Architecture:** Add a new domain (`SchoolAnnouncement` + recipients) with school-scoped CRUD/publish API and page routes for escola and responsavel. Publishing creates recipients and notifications with `SYSTEM_ANNOUNCEMENT`, while event notifications remain unchanged. Deliver in small TDD slices: migration/model, API, pages, notification wiring, and integration tests.

**Tech Stack:** AdonisJS 7, Lucid ORM, Inertia React, TypeScript, Japa functional tests.

---

### Task 1: Add schema for announcements and recipients

**Files:**

- Create: `database/migrations/1768600000000_create_school_announcement_tables.ts`
- Test: `tests/functional/comunicados/school_announcements_api.spec.ts`

**Step 1: Write the failing test**

```ts
test('creates school announcement records in DB via API flow', async ({ client }) => {
  const ctx = await createAuthenticatedSchoolAdmin(client)
  const response = await client.post('/api/v1/school-announcements').json({
    title: 'Comunicado teste',
    body: 'Conteudo',
  })

  response.assertStatus(201)
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test functional --files tests/functional/comunicados/school_announcements_api.spec.ts`
Expected: FAIL with relation/table not found.

**Step 3: Write minimal implementation**

Create migration with:

- `SchoolAnnouncement` table (`id`, `schoolId`, `title`, `body`, `status`, `publishedAt`, `createdByUserId`, timestamps)
- `SchoolAnnouncementRecipient` table (`id`, `announcementId`, `studentId`, `responsibleId`, `notificationId`, `createdAt`)
- indexes for `schoolId`, `status`, `announcementId`, `responsibleId`

**Step 4: Run test to verify it passes**

Run: `node ace migration:run && node ace test functional --files tests/functional/comunicados/school_announcements_api.spec.ts`
Expected: test now fails later (controller missing), but no table-missing error.

**Step 5: Commit**

```bash
git add database/migrations/1768600000000_create_school_announcement_tables.ts
git commit -m "feat(comunicados): add announcement and recipient tables"
```

### Task 2: Add Lucid models and DTO/transformer

**Files:**

- Create: `app/models/school_announcement.ts`
- Create: `app/models/school_announcement_recipient.ts`
- Create: `app/models/dto/school_announcement.dto.ts`
- Create: `app/transformers/school_announcement_transformer.ts`
- Test: `tests/functional/comunicados/school_announcements_api.spec.ts`

**Step 1: Write the failing test**

```ts
test('returns created announcement with expected contract', async ({ client, assert }) => {
  const ctx = await createAuthenticatedSchoolAdmin(client)
  const response = await client.post('/api/v1/school-announcements').json({
    title: 'Titulo',
    body: 'Corpo',
  })

  response.assertStatus(201)
  assert.exists(response.body().id)
  assert.equal(response.body().status, 'DRAFT')
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test functional --files tests/functional/comunicados/school_announcements_api.spec.ts`
Expected: FAIL because models/serialization do not exist.

**Step 3: Write minimal implementation**

Implement both models with UUID beforeCreate, typed columns, relations, and DTO/transformer output matching API contract.

**Step 4: Run test to verify it passes**

Run: `node ace test functional --files tests/functional/comunicados/school_announcements_api.spec.ts`
Expected: still failing on route/controller, but model/serialization imports resolve.

**Step 5: Commit**

```bash
git add app/models/school_announcement.ts app/models/school_announcement_recipient.ts app/models/dto/school_announcement.dto.ts app/transformers/school_announcement_transformer.ts
git commit -m "feat(comunicados): add announcement domain models and transformer"
```

### Task 3: Implement escola API for create/list/show/update draft

**Files:**

- Create: `app/validators/school_announcement.ts`
- Create: `app/controllers/school_announcements/list_school_announcements_controller.ts`
- Create: `app/controllers/school_announcements/show_school_announcement_controller.ts`
- Create: `app/controllers/school_announcements/create_school_announcement_controller.ts`
- Create: `app/controllers/school_announcements/update_school_announcement_controller.ts`
- Create: `start/routes/api/school_announcements.ts`
- Modify: `start/routes/api/index.ts`
- Test: `tests/functional/comunicados/school_announcements_api.spec.ts`

**Step 1: Write the failing tests**

```ts
test('creates draft announcement for selected school', async ({ client }) => {
  const ctx = await createAuthenticatedSchoolAdmin(client)
  const response = await client.post('/api/v1/school-announcements').json({
    title: 'Aviso',
    body: 'Texto',
  })
  response.assertStatus(201)
  response.assertBodyContains({ status: 'DRAFT' })
})

test('updates draft announcement but blocks update after publish', async ({ client }) => {
  // create draft, update 200, publish, update again -> 409
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test functional --files tests/functional/comunicados/school_announcements_api.spec.ts`
Expected: FAIL with route/controller not found.

**Step 3: Write minimal implementation**

Add API group `/api/v1/school-announcements` with auth+impersonation, scoped by selected school and role checks.

**Step 4: Run test to verify it passes**

Run: `node ace test functional --files tests/functional/comunicados/school_announcements_api.spec.ts`
Expected: PASS for create/list/show/update draft scenarios.

**Step 5: Commit**

```bash
git add app/validators/school_announcement.ts app/controllers/school_announcements/*.ts start/routes/api/school_announcements.ts start/routes/api/index.ts tests/functional/comunicados/school_announcements_api.spec.ts
git commit -m "feat(comunicados): add school announcements draft CRUD api"
```

### Task 4: Implement publish endpoint with idempotency and recipients

**Files:**

- Create: `app/controllers/school_announcements/publish_school_announcement_controller.ts`
- Modify: `start/routes/api/school_announcements.ts`
- Modify: `app/controllers/school_announcements/create_school_announcement_controller.ts`
- Modify: `tests/functional/comunicados/school_announcements_api.spec.ts`

**Step 1: Write the failing tests**

```ts
test('publishes draft once and creates recipients', async ({ client, assert }) => {
  const ctx = await createAuthenticatedSchoolAdmin(client)
  const ann = await createDraftAnnouncement(ctx.school.id, ctx.user.id)

  const response = await client.post(`/api/v1/school-announcements/${ann.id}/publish`)
  response.assertStatus(200)
  assert.equal(response.body().status, 'PUBLISHED')
})

test('returns 409 when publishing already published announcement', async ({ client }) => {
  // publish once, publish twice -> 409
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test functional --files tests/functional/comunicados/school_announcements_api.spec.ts`
Expected: FAIL because publish endpoint/transaction not implemented.

**Step 3: Write minimal implementation**

Implement publish controller:

- validates status transition
- resolves responsible recipients from school students relations
- transaction updates announcement status and inserts recipients

**Step 4: Run test to verify it passes**

Run: `node ace test functional --files tests/functional/comunicados/school_announcements_api.spec.ts`
Expected: PASS for publish/idempotency/recipient creation.

**Step 5: Commit**

```bash
git add app/controllers/school_announcements/publish_school_announcement_controller.ts start/routes/api/school_announcements.ts tests/functional/comunicados/school_announcements_api.spec.ts
git commit -m "feat(comunicados): publish announcements with recipient tracking"
```

### Task 5: Wire notification creation from publish flow

**Files:**

- Modify: `app/controllers/school_announcements/publish_school_announcement_controller.ts`
- Modify: `app/models/notification.ts` (if type union needs additions only)
- Modify: `tests/functional/comunicados/school_announcements_api.spec.ts`

**Step 1: Write the failing test**

```ts
test('creates SYSTEM_ANNOUNCEMENT notifications for recipients on publish', async ({
  client,
  assert,
}) => {
  const ctx = await createAuthenticatedSchoolAdmin(client)
  const ann = await createDraftAnnouncement(ctx.school.id, ctx.user.id)
  const response = await client.post(`/api/v1/school-announcements/${ann.id}/publish`)

  response.assertStatus(200)
  const notifications = await findNotificationsByTitle('Comunicado teste')
  assert.isAbove(notifications.length, 0)
  assert.equal(notifications[0].type, 'SYSTEM_ANNOUNCEMENT')
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test functional --files tests/functional/comunicados/school_announcements_api.spec.ts`
Expected: FAIL because publish does not generate notifications yet.

**Step 3: Write minimal implementation**

In publish controller, create `Notification` rows for each recipient with:

- `type: SYSTEM_ANNOUNCEMENT`
- `title/message` from comunicado
- `actionUrl: /responsavel/comunicados/:id`

Persist `notificationId` back to recipient rows.

**Step 4: Run test to verify it passes**

Run: `node ace test functional --files tests/functional/comunicados/school_announcements_api.spec.ts`
Expected: PASS with notification assertions.

**Step 5: Commit**

```bash
git add app/controllers/school_announcements/publish_school_announcement_controller.ts tests/functional/comunicados/school_announcements_api.spec.ts
git commit -m "feat(comunicados): dispatch in-app notifications on publish"
```

### Task 6: Add responsavel read API and page controllers

**Files:**

- Create: `app/controllers/responsavel/list_comunicados_controller.ts`
- Create: `app/controllers/responsavel/show_comunicado_controller.ts`
- Modify: `start/routes/api/responsavel.ts`
- Modify: `app/controllers/pages/responsavel/show_responsavel_comunicados_page_controller.ts`
- Test: `tests/functional/comunicados/responsavel_comunicados_api.spec.ts`

**Step 1: Write the failing tests**

```ts
test('lists only published announcements visible to authenticated responsavel', async ({
  client,
}) => {
  const ctx = await createAuthenticatedResponsavel(client)
  const response = await client.get('/api/v1/responsavel/comunicados')
  response.assertStatus(200)
})

test('blocks access to comunicado from another school scope', async ({ client }) => {
  // expected 404
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test functional --files tests/functional/comunicados/responsavel_comunicados_api.spec.ts`
Expected: FAIL with missing routes/controllers.

**Step 3: Write minimal implementation**

Add responsavel API endpoints that join recipient table and enforce user scope.

**Step 4: Run test to verify it passes**

Run: `node ace test functional --files tests/functional/comunicados/responsavel_comunicados_api.spec.ts`
Expected: PASS for visibility and isolation scenarios.

**Step 5: Commit**

```bash
git add app/controllers/responsavel/list_comunicados_controller.ts app/controllers/responsavel/show_comunicado_controller.ts start/routes/api/responsavel.ts tests/functional/comunicados/responsavel_comunicados_api.spec.ts
git commit -m "feat(comunicados): add responsavel comunicado read api"
```

### Task 7: Add escola and responsavel UI pages for announcements

**Files:**

- Create: `app/controllers/pages/escola/show_comunicados_page_controller.ts`
- Create: `app/controllers/pages/escola/show_novo_comunicado_page_controller.ts`
- Create: `app/controllers/pages/escola/show_editar_comunicado_page_controller.ts`
- Create: `inertia/pages/escola/comunicados.tsx`
- Create: `inertia/pages/escola/comunicados/novo.tsx`
- Create: `inertia/pages/escola/comunicados/editar.tsx`
- Modify: `start/routes/pages/escola.ts`
- Modify: `inertia/components/layouts/escola-layout.tsx`
- Modify: `inertia/pages/responsavel/comunicados.tsx`
- Test: `tests/functional/comunicados/comunicados_pages.spec.ts`

**Step 1: Write the failing tests**

```ts
test('renders escola comunicados page for authenticated school user', async ({ client }) => {
  await createAuthenticatedSchoolAdmin(client)
  const response = await client.get('/escola/comunicados')
  response.assertStatus(200)
})

test('renders responsavel comunicados page and no longer depends on generic notifications list', async ({
  client,
}) => {
  await createAuthenticatedResponsavel(client)
  const response = await client.get('/responsavel/comunicados')
  response.assertStatus(200)
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test functional --files tests/functional/comunicados/comunicados_pages.spec.ts`
Expected: FAIL because escola comunicado routes/pages do not exist.

**Step 3: Write minimal implementation**

Add page controllers/routes and initial Inertia pages with fetch hooks to new APIs. Add "Comunicados" item in escola nav.

**Step 4: Run test to verify it passes**

Run: `node ace test functional --files tests/functional/comunicados/comunicados_pages.spec.ts`
Expected: PASS with page routes active.

**Step 5: Commit**

```bash
git add app/controllers/pages/escola/show_comunicados_page_controller.ts app/controllers/pages/escola/show_novo_comunicado_page_controller.ts app/controllers/pages/escola/show_editar_comunicado_page_controller.ts inertia/pages/escola/comunicados.tsx inertia/pages/escola/comunicados/novo.tsx inertia/pages/escola/comunicados/editar.tsx start/routes/pages/escola.ts inertia/components/layouts/escola-layout.tsx inertia/pages/responsavel/comunicados.tsx tests/functional/comunicados/comunicados_pages.spec.ts
git commit -m "feat(comunicados): add escola and responsavel comunicado pages"
```

### Task 8: Keep events and existing notifications behavior isolated

**Files:**

- Modify: `tests/functional/comunicados/school_announcements_api.spec.ts`
- Modify: `tests/functional/queue/jobs_dispatch.spec.ts`

**Step 1: Write the failing test**

```ts
test('publishing school announcement does not create EventNotification records', async ({
  client,
  assert,
}) => {
  const ann = await seedDraftAndPublishViaApi(client)
  const eventNotifications = await findEventNotificationsForAnnouncementTitle(ann.title)
  assert.lengthOf(eventNotifications, 0)
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test functional --files tests/functional/comunicados/school_announcements_api.spec.ts`
Expected: FAIL if implementation accidentally touches event path.

**Step 3: Write minimal implementation**

Ensure publish controller only writes `Notification` and announcement tables; no `EventNotification` write/import.

**Step 4: Run test to verify it passes**

Run: `node ace test functional --files tests/functional/comunicados/school_announcements_api.spec.ts`
Expected: PASS with domain separation assertion.

**Step 5: Commit**

```bash
git add tests/functional/comunicados/school_announcements_api.spec.ts tests/functional/queue/jobs_dispatch.spec.ts
git commit -m "test(comunicados): guard separation from event notification flow"
```

### Task 9: Final verification and documentation sync

**Files:**

- Modify: `docs/plans/2026-03-05-comunicados-design.md` (only if implementation notes need updates)
- Test: `tests/functional/comunicados/school_announcements_api.spec.ts`
- Test: `tests/functional/comunicados/responsavel_comunicados_api.spec.ts`
- Test: `tests/functional/comunicados/comunicados_pages.spec.ts`

**Step 1: Run focused comunicado specs**

Run: `node ace test functional --files tests/functional/comunicados/school_announcements_api.spec.ts`
Expected: PASS.

Run: `node ace test functional --files tests/functional/comunicados/responsavel_comunicados_api.spec.ts`
Expected: PASS.

Run: `node ace test functional --files tests/functional/comunicados/comunicados_pages.spec.ts`
Expected: PASS.

**Step 2: Run broader functional sanity check**

Run: `node ace test functional`
Expected: PASS, or unrelated failures documented.

**Step 3: Verify type generation if routes changed**

Run: `node ace generate:manifest`
Expected: route manifest/types updated without errors.

**Step 4: Commit final docs/manifests (if changed)**

```bash
git add docs/plans/2026-03-05-comunicados-design.md .adonisjs
git commit -m "chore(comunicados): sync generated route artifacts and notes"
```
