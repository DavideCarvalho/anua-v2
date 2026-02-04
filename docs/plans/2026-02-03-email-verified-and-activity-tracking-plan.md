# Email Verification & Activity Tracking Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add `emailVerifiedAt` and `lastLoggedInAt` columns to User, set them on OTP verify and via global middleware respectively, and protect verified emails from being overwritten by enrollment/edit forms.

**Architecture:** One migration adds two nullable timestamp columns to the `User` table. `emailVerifiedAt` is set once in `VerifyCodeController` after OTP login. A new `TrackActivityMiddleware` updates `lastLoggedInAt` on every authenticated request (throttled to 5-min intervals). Both `enroll_student_controller` and `full_update_student_controller` check `emailVerifiedAt` before overwriting a responsible's email.

**Tech Stack:** AdonisJS 6, Lucid ORM, PostgreSQL, Luxon DateTime

---

## Task 1: Migration — Add Columns to User Table

**Files:**
- Create: `database/migrations/1768500144000_add_email_verified_and_last_logged_in_to_users.ts`

**Step 1:** Create the migration file:

```typescript
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'User'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('emailVerifiedAt').nullable()
      table.timestamp('lastLoggedInAt').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('emailVerifiedAt')
      table.dropColumn('lastLoggedInAt')
    })
  }
}
```

**Step 2:** Run the migration:

```bash
node ace migration:run
```

Expected: Migration runs successfully, two new nullable columns on `User`.

---

## Task 2: User Model — Add Column Declarations

**Files:**
- Modify: `app/models/user.ts:82-87` (after `schoolChainId` column, before `createdAt`)

**Step 1:** Add the two new column declarations right before the `createdAt` column (line 83):

```typescript
@column.dateTime({ columnName: 'emailVerifiedAt' })
declare emailVerifiedAt: DateTime | null

@column.dateTime({ columnName: 'lastLoggedInAt' })
declare lastLoggedInAt: DateTime | null
```

Insert these after line 81 (`declare schoolChainId: string | null`) and before line 83 (`@column.dateTime({ autoCreate: true, columnName: 'createdAt' })`).

---

## Task 3: VerifyCodeController — Set emailVerifiedAt on First OTP Login

**Files:**
- Modify: `app/controllers/auth/verify_code.ts:29-30`

**Step 1:** Add `DateTime` import at the top (line 2):

```typescript
import { DateTime } from 'luxon'
```

**Step 2:** After `await auth.use('web').login(user)` (line 29), add:

```typescript
      await auth.use('web').login(user)

      // Set emailVerifiedAt on first OTP verification (proves email ownership)
      if (!user.emailVerifiedAt) {
        user.emailVerifiedAt = DateTime.now()
        await user.save()
      }
```

The rest of the controller (return response with preloaded user) stays unchanged.

---

## Task 4: TrackActivityMiddleware — Update lastLoggedInAt

**Files:**
- Create: `app/middleware/track_activity_middleware.ts`
- Modify: `start/kernel.ts:41-42`

**Step 1:** Create the middleware file:

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { DateTime } from 'luxon'

export default class TrackActivityMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    if (ctx.auth.isAuthenticated) {
      const user = ctx.auth.user!
      const now = DateTime.now()

      if (!user.lastLoggedInAt || now.diff(user.lastLoggedInAt, 'minutes').minutes >= 5) {
        user.lastLoggedInAt = now
        user.save() // fire-and-forget, don't block the response
      }
    }

    return next()
  }
}
```

**Step 2:** Register in `start/kernel.ts`. Add after the `initialize_auth_middleware` line (line 41):

```typescript
  () => import('@adonisjs/auth/initialize_auth_middleware'),
  () => import('#middleware/track_activity_middleware'),
```

This ensures the middleware runs after auth is initialized (so `ctx.auth.isAuthenticated` and `ctx.auth.user` are available).

---

## Task 5: Email Guard — Enroll Student Controller

**Files:**
- Modify: `app/controllers/students/enroll_student_controller.ts:190-191`

**Step 1:** In the responsible linking block (~line 190), when an existing responsible is found, add the email guard and allow updating unverified emails:

Change from:
```typescript
          if (existingResponsible) {
            responsibleUser = existingResponsible
          } else {
```

To:
```typescript
          if (existingResponsible) {
            responsibleUser = existingResponsible
            // Update email only if user hasn't verified theirs yet
            if (!existingResponsible.emailVerifiedAt && respData.email) {
              existingResponsible.email = respData.email
              await existingResponsible.useTransaction(trx).save()
            }
          } else {
```

---

## Task 6: Email Guard — Full Update Student Controller

**Files:**
- Modify: `app/controllers/students/full_update_student_controller.ts:138-148`

**Step 1:** In the responsible update block (~line 138-148), guard the email field when merging:

Change from:
```typescript
          if (existingResponsible) {
            responsibleUser = existingResponsible
            // Update existing responsible data
            responsibleUser.merge({
              name: respData.name,
              email: respData.email,
              phone: respData.phone,
              birthDate: DateTime.fromISO(respData.birthDate),
              documentType: respData.documentType,
            })
            await responsibleUser.useTransaction(trx).save()
```

To:
```typescript
          if (existingResponsible) {
            responsibleUser = existingResponsible
            // Update existing responsible data (skip email if already verified)
            responsibleUser.merge({
              name: respData.name,
              ...(!existingResponsible.emailVerifiedAt && respData.email
                ? { email: respData.email }
                : {}),
              phone: respData.phone,
              birthDate: DateTime.fromISO(respData.birthDate),
              documentType: respData.documentType,
            })
            await responsibleUser.useTransaction(trx).save()
```

---

## Files Summary

| Action | File |
|--------|------|
| Create | `database/migrations/1768500144000_add_email_verified_and_last_logged_in_to_users.ts` |
| Create | `app/middleware/track_activity_middleware.ts` |
| Modify | `app/models/user.ts` (add 2 column declarations) |
| Modify | `app/controllers/auth/verify_code.ts` (set emailVerifiedAt on OTP verify) |
| Modify | `start/kernel.ts` (register TrackActivityMiddleware) |
| Modify | `app/controllers/students/enroll_student_controller.ts` (email guard on link) |
| Modify | `app/controllers/students/full_update_student_controller.ts` (email guard on merge) |

## Verification

1. Run migration: `node ace migration:run`
2. Log in via OTP — check that `emailVerifiedAt` is set on User record
3. Navigate any authenticated page — check `lastLoggedInAt` is set
4. Refresh within 5 min — `lastLoggedInAt` should NOT update
5. Wait 5 min, refresh — `lastLoggedInAt` should update
6. Enroll a student with a responsible whose email is verified — email should NOT be overwritten
7. Enroll with unverified responsible — email SHOULD be updated from form
8. Edit student with verified responsible — email should NOT change
9. Edit student with unverified responsible — email should update
