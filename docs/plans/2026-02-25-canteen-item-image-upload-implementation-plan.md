# Canteen Item Image Upload Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add one main image upload per canteen item (create/edit/remove/display) using Adonis Drive + `@jrmc/adonis-attachment`.

**Architecture:** Persist a single attachment on `CanteenItem`, expose stable image URLs through DTOs, and migrate create/update APIs to accept multipart payloads with optional file `image`. Keep existing fields and behavior unchanged for non-image flows.

**Tech Stack:** AdonisJS 6, Lucid, Vine validators, Tuyau, Inertia React, Adonis Drive, `@jrmc/adonis-attachment`.

---

### Task 1: Add image persistence to canteen item domain

**Files:**

- Create: `database/migrations/202602250001_add_image_to_canteen_item.ts`
- Modify: `app/models/canteen_item.ts`
- Modify: `app/models/dto/canteen_item.dto.ts`

**Step 1: Write failing test (model + dto expectation)**

Create `tests/unit/canteen_item_image.spec.ts` with assertions that:

- `CanteenItemDto` exposes `imageUrl` when model has image attachment metadata.
- Empty image state returns `null` URL.

**Step 2: Run test to verify it fails**

Run: `node ace test tests/unit/canteen_item_image.spec.ts`
Expected: FAIL because image fields are not implemented.

**Step 3: Write minimal implementation**

- Add migration column(s) required by attachment strategy for `CanteenItem` image metadata.
- Add attachment field to `CanteenItem` model.
- Add `imageUrl` (and optional thumb URL) mapping in DTO.

**Step 4: Run test to verify it passes**

Run: `node ace test tests/unit/canteen_item_image.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add database/migrations/202602250001_add_image_to_canteen_item.ts app/models/canteen_item.ts app/models/dto/canteen_item.dto.ts tests/unit/canteen_item_image.spec.ts
git commit -m "feat: add canteen item image attachment field"
```

### Task 2: Support multipart image upload in create/update item controllers

**Files:**

- Modify: `app/validators/canteen.ts`
- Modify: `app/controllers/canteen_items/create_canteen_item_controller.ts`
- Modify: `app/controllers/canteen_items/update_canteen_item_controller.ts`
- Create: `tests/functional/canteen_items/image_upload.spec.ts`

**Step 1: Write failing functional tests**

In `tests/functional/canteen_items/image_upload.spec.ts`, cover:

- create item with multipart image returns 201 and `imageUrl`.
- update item with new image replaces previous image URL.
- update with `removeImage=true` clears image URL.
- invalid mime/size returns 400.

**Step 2: Run tests to verify they fail**

Run: `node ace test tests/functional/canteen_items/image_upload.spec.ts`
Expected: FAIL because controllers currently only handle JSON fields.

**Step 3: Write minimal implementation**

- Extend validators for multipart-safe image/removal fields.
- Parse form data + file in controllers.
- Attach uploaded image to item on create/update.
- Remove existing attachment when `removeImage=true`.
- Keep existing canteen ownership checks.

**Step 4: Run tests to verify they pass**

Run: `node ace test tests/functional/canteen_items/image_upload.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/validators/canteen.ts app/controllers/canteen_items/create_canteen_item_controller.ts app/controllers/canteen_items/update_canteen_item_controller.ts tests/functional/canteen_items/image_upload.spec.ts
git commit -m "feat: handle canteen item image upload and removal"
```

### Task 3: Add image input/preview/remove in canteen items UI

**Files:**

- Modify: `inertia/containers/canteen-items-container.tsx`
- Modify: `inertia/hooks/mutations/use_canteen_item_mutations.ts`
- Modify: `inertia/hooks/queries/use_canteen_items.ts`
- Modify: `.adonisjs/api.ts` (generated)

**Step 1: Write failing UI behavior test (or interaction harness)**

Create `tests/browser/canteen-items-image-upload.spec.ts` (or equivalent interaction test script) to assert:

- create modal accepts an image and shows preview.
- edit modal can replace/remove image.
- card renders uploaded thumbnail.

**Step 2: Run test to verify it fails**

Run: `node ace test tests/browser/canteen-items-image-upload.spec.ts`
Expected: FAIL because UI has no image controls.

**Step 3: Write minimal implementation**

- Add file input + preview in create/edit dialogs.
- Send multipart payload from mutations.
- Add remove-image toggle/intent in edit flow.
- Render thumbnail/fallback in item cards.

**Step 4: Regenerate API types and run test**

Run:

- `node ace tuyau:generate`
- `node ace test tests/browser/canteen-items-image-upload.spec.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add inertia/containers/canteen-items-container.tsx inertia/hooks/mutations/use_canteen_item_mutations.ts inertia/hooks/queries/use_canteen_items.ts .adonisjs/api.ts tests/browser/canteen-items-image-upload.spec.ts
git commit -m "feat: add canteen item image upload UI"
```

### Task 4: Verify end-to-end and cleanup

**Files:**

- Modify: `dogfood-output/cantina-rerun-2026-02-25/report.md` (optional verification note)
- Modify: `docs/plans/2026-02-25-canteen-item-image-upload-design.md` (status update, optional)

**Step 1: Run full verification commands**

Run:

- `node ace tuyau:generate`
- `npm run typecheck`
- `node ace test`

Expected: all pass.

**Step 2: Manual dogfood checklist**

Use browser agent on `/escola/cantina/itens`:

- create item with image,
- create item without image,
- edit and replace image,
- remove image,
- delete item with image,
- verify no broken UI states.

**Step 3: Record evidence**

- Save screenshots in `dogfood-output/cantina-rerun-2026-02-25/screenshots/`.
- Note final status in report.

**Step 4: Final commit**

```bash
git add dogfood-output/cantina-rerun-2026-02-25/report.md docs/plans/2026-02-25-canteen-item-image-upload-design.md
git commit -m "chore: verify canteen item image upload flow"
```
