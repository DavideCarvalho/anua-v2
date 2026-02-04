# Email Verification & Activity Tracking Design

## Goal

Track when users verify their email (first OTP login) and when they were last active. Protect verified emails from being overwritten by enrollment/edit forms.

## Architecture

Two new timestamp columns on `users`. `emailVerifiedAt` is set once in `VerifyCodeController` on first OTP verification. `lastLoggedInAt` is updated by a global middleware on every authenticated request, throttled to every 5 minutes. Enrollment and edit flows check `emailVerifiedAt` before overwriting a responsible's email.

---

## Database

One migration adding two nullable columns to `users`:

| Column | Type | Set by | Behavior |
|--------|------|--------|----------|
| `email_verified_at` | timestamp, nullable | VerifyCodeController | Set once on first OTP verify, never overwritten |
| `last_logged_in_at` | timestamp, nullable | TrackActivityMiddleware | Updated every 5 min on authenticated requests |

Both default to `null` for existing users.

---

## emailVerifiedAt

Set in `VerifyCodeController`, after `auth.use('web').login(user)`:

```typescript
if (!user.emailVerifiedAt) {
  user.emailVerifiedAt = DateTime.now()
  await user.save()
}
```

One-time write. Proves email ownership via OTP.

---

## lastLoggedInAt — Global Middleware

New `TrackActivityMiddleware` registered in `kernel.ts` after `initialize_auth_middleware`.

Logic:
1. Check `ctx.auth.isAuthenticated`
2. If `user.lastLoggedInAt` is null or older than 5 minutes → update
3. Fire-and-forget save (no await, don't block response)

```typescript
if (!user.lastLoggedInAt || user.lastLoggedInAt.diffNow('minutes').minutes < -5) {
  user.lastLoggedInAt = DateTime.now()
  user.save() // no await
}
```

---

## Email Protection

Rule: if a responsible already exists (by document) and has `emailVerifiedAt` set, don't overwrite their email from enrollment/edit forms. If `emailVerifiedAt` is null, allow updating (school fixing typos before first login).

Applies to:
- `enroll_student_controller.ts` — responsible linking block
- `update_enrollment_controller.ts` — responsible update block

```typescript
if (existingResponsible) {
  responsibleUser = existingResponsible
  if (!existingResponsible.emailVerifiedAt && respData.email) {
    existingResponsible.email = respData.email
    await existingResponsible.save()
  }
}
```

---

## Files Summary

| Action | File |
|--------|------|
| Create | Migration: `add_email_verified_and_last_logged_in_to_users` |
| Create | `app/middleware/track_activity_middleware.ts` |
| Modify | `app/models/user.ts` (add 2 columns) |
| Modify | `start/kernel.ts` (register middleware) |
| Modify | `app/controllers/auth/verify_code_controller.ts` (set emailVerifiedAt) |
| Modify | `app/controllers/students/enroll_student_controller.ts` (email guard) |
| Modify | `app/controllers/students/update_enrollment_controller.ts` (email guard) |
