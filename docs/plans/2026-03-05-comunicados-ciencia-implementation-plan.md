# Comunicados com Ciencia Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add optional acknowledgement requirement per school announcement with persistent pending alerts for responsaveis.

**Architecture:** Extend announcement and recipient schema with acknowledgement fields, compute recipient acknowledgement status in backend transformers/services, and expose dedicated responsavel endpoints for acknowledging and listing pending items. Update escola forms and responsavel pages to configure and complete acknowledgement flow.

**Tech Stack:** AdonisJS 7, Lucid ORM, Inertia React, TypeScript, Japa.

---

### Task 1: Add failing tests for acknowledgement status rules

**Files:**

- Create: `tests/unit/school_announcements/school_announcement_acknowledgement_service.spec.ts`
- Create: `app/services/school_announcements/school_announcement_acknowledgement_service.ts`

**Step 1: Write the failing test**

```ts
test('returns PENDING_ACK when requires acknowledgement and not expired', ({ assert }) => {
  const status = getRecipientAcknowledgementStatus({
    requiresAcknowledgement: true,
    acknowledgedAt: null,
    acknowledgementDueAt: DateTime.now().plus({ day: 1 }),
  })
  assert.equal(status, 'PENDING_ACK')
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test --files tests/unit/school_announcements/school_announcement_acknowledgement_service.spec.ts`

**Step 3: Write minimal implementation**

Create service with status helper.

**Step 4: Run test to verify it passes**

Run: `node ace test --files tests/unit/school_announcements/school_announcement_acknowledgement_service.spec.ts`

**Step 5: Commit**

```bash
git add tests/unit/school_announcements/school_announcement_acknowledgement_service.spec.ts app/services/school_announcements/school_announcement_acknowledgement_service.ts
git commit -m "feat(comunicados): add acknowledgement status rules"
```

### Task 2: Add DB schema and models fields for acknowledgement

**Files:**

- Create: `database/migrations/1768600002000_add_acknowledgement_to_school_announcements.ts`
- Modify: `app/models/school_announcement.ts`
- Modify: `app/models/school_announcement_recipient.ts`

**Step 1: Write failing functional assertion (if not already)**

Add assertion in comunicado functional suite expecting returned fields.

**Step 2: Run test to verify failure**

Run relevant spec.

**Step 3: Implement migration/model columns**

Add `requiresAcknowledgement`, `acknowledgementDueAt`, `acknowledgedAt`.

**Step 4: Re-run tests**

Ensure no schema errors.

**Step 5: Commit**

```bash
git add database/migrations/1768600002000_add_acknowledgement_to_school_announcements.ts app/models/school_announcement.ts app/models/school_announcement_recipient.ts
git commit -m "feat(comunicados): persist acknowledgement settings and confirmations"
```

### Task 3: Wire create/update/publish and responsavel ack endpoints

**Files:**

- Modify: `app/validators/school_announcement.ts`
- Modify: `app/controllers/school_announcements/create_school_announcement_controller.ts`
- Modify: `app/controllers/school_announcements/update_school_announcement_controller.ts`
- Modify: `app/controllers/school_announcements/publish_school_announcement_controller.ts`
- Create: `app/controllers/responsavel/acknowledge_comunicado_controller.ts`
- Create: `app/controllers/responsavel/list_pending_acknowledgements_controller.ts`
- Modify: `start/routes/api/responsavel.ts`

**Step 1: Write failing functional tests**

Add tests for ack endpoint and pending endpoint.

**Step 2: Run tests to fail**

Run: `node ace test --files tests/functional/comunicados/responsavel_comunicados_api.spec.ts`

**Step 3: Minimal implementation**

Implement controllers and route wiring.

**Step 4: Re-run tests to pass**

Run same spec.

**Step 5: Commit**

```bash
git add app/validators/school_announcement.ts app/controllers/school_announcements/create_school_announcement_controller.ts app/controllers/school_announcements/update_school_announcement_controller.ts app/controllers/school_announcements/publish_school_announcement_controller.ts app/controllers/responsavel/acknowledge_comunicado_controller.ts app/controllers/responsavel/list_pending_acknowledgements_controller.ts start/routes/api/responsavel.ts
git commit -m "feat(comunicados): add responsavel acknowledgement APIs"
```

### Task 4: Update transformers and responsavel/escola UI

**Files:**

- Modify: `app/transformers/school_announcement_transformer.ts`
- Modify: `inertia/pages/escola/comunicados/novo.tsx`
- Modify: `inertia/pages/escola/comunicados/editar.tsx`
- Modify: `inertia/pages/responsavel/comunicados.tsx`
- Modify: `inertia/pages/responsavel/index.tsx` (or current dashboard page)

**Step 1: Add failing frontend test or smoke assertion**
**Step 2: Run test to fail**
**Step 3: Implement UI controls/status rendering**
**Step 4: Run lint/typecheck/tests**
**Step 5: Commit**

### Task 5: Final verification

**Files:** all touched above

**Step 1:** `pnpm exec eslint ...`
**Step 2:** `pnpm exec tsc -p tsconfig.json --noEmit`
**Step 3:** Run focused unit/functional specs
**Step 4:** Optional `node ace test functional`
**Step 5:** commit remaining generated artifacts
