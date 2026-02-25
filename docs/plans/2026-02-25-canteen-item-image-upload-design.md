# Canteen Item Image Upload Design

Date: 2026-02-25
Status: Approved in chat
Scope: Escola cantina item CRUD (`/escola/cantina/itens`) with one main image per item using Adonis Drive + `@jrmc/adonis-attachment`.

## Goals

- Add a single main image for each canteen item.
- Use existing Drive infrastructure and `adonis-attachment` package.
- Keep existing canteen item flows working (create, edit, list, toggle, delete).
- Expose stable image URLs to frontend without manual URL composition.

## Non-Goals

- Multiple images per item (gallery).
- External presigned direct-upload flow.
- Advanced image editor/cropping UI.

## Architecture

Recommended approach: model-level attachment on `CanteenItem`.

- Persist one image attachment per item in the canteen item model.
- Generate and store metadata through `adonis-attachment`.
- Reuse configured converter(s) and default Drive disk (`fs` locally, `gcs` when configured).
- Keep API contract backward compatible, only extending payload/response with image fields.

## Data Model Changes

- Extend `CanteenItem` persistence with an attachment field for the image.
- Expose image URLs in DTO (at least `imageUrl`; optional `imageThumbUrl`).
- Ensure item deletion also removes associated image files to avoid orphaned uploads.

## API Design

### Create Item (`POST /api/v1/canteen-items`)

- Content type: `multipart/form-data`.
- Accept existing fields (`canteenId`, `name`, `description`, `price`, `category`, `isActive`) plus optional file `image`.
- Validate file type/size and reject invalid payload with clear error messages.
- Return created item with image URL(s).

### Update Item (`PATCH /api/v1/canteen-items/:id`)

- Content type: `multipart/form-data`.
- Accept existing mutable fields plus optional file `image`.
- If a new `image` is provided, replace current image.
- Support explicit image removal via `removeImage=true` flag.
- Return updated item with image URL(s).

### List/Show Item

- Include image URL fields in DTO so frontend can render thumbnails/cards directly.

## Frontend UX

In `CanteenItemsContainer`:

- Create modal:
  - add image picker (single file), with preview before save.
- Edit modal:
  - show current image, allow replace and remove.
- Item cards/grid:
  - render thumbnail when available.
  - fallback to icon/placeholder when no image.

## Validation and Security

- Validate extension + mime + size (image only, e.g. max 2MB).
- Never trust client filename/path.
- Keep school/canteen ownership checks already present in controllers.
- Ensure cleanup on replace/delete to prevent stale files.

## Error Handling

- Upload/validation errors return user-friendly messages.
- If upload fails, do not persist partial item state.
- If DB update fails after upload, cleanup uploaded file in rollback path when possible.

## Verification Plan

- Type checks:
  - `node ace tuyau:generate`
  - `npm run typecheck`
- Manual dogfood in `/escola/cantina/itens`:
  - create item with image,
  - create item without image,
  - edit and replace image,
  - remove image,
  - delete item and verify no broken thumbnails.
- Confirm images work on both local `fs` and configured remote disk behavior.

## Risks

- Multipart + JSON field parsing differences in existing Tuyau clients.
- File cleanup edge cases on partial failures.
- Existing validators already include `imageUrl`/`stockQuantity` fields not mapped in model; needs cleanup/alignment during implementation.
