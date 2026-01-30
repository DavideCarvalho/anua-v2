# Emergency Contact - User Linking via Responsibles

## Problem

`StudentEmergencyContact.userId` is always null. The system never links emergency contacts to existing users.

## Solution

Allow emergency contacts to be linked to responsibles already registered for the student. Two modes per contact:

1. **Responsible mode**: user selects a responsible from a dropdown. Fields (name, phone, relationship) auto-fill and become read-only. `userId` is saved from the responsible's user record.
2. **Manual mode**: user types name, phone, relationship freely. `userId` stays null.

## No Migration Needed

The `StudentEmergencyContact` table already has a nullable `userId` column with FK to `User`.

## Backend Changes

### Validator (`app/validators/student.ts`)

Add `responsibleUserId` (optional UUID) to both `emergencyContacts` schemas (enroll and full update).

### Controllers (3 files)

- `app/controllers/students/enroll_student_controller.ts`
- `app/controllers/students/full_update_student_controller.ts`
- `app/controllers/online-enrollment/finish_enrollment_controller.ts`

In each, set `userId: contact.responsibleUserId ?? null` when creating `StudentEmergencyContact`.

## Frontend Changes

### Schema (`inertia/containers/students/new-student-modal/schema.ts`)

Add optional fields to emergency contact zod schema:
- `responsibleUserId: z.string().uuid().optional()`
- `responsibleIndex: z.number().optional()`

### Medical Info Step (`inertia/containers/students/new-student-modal/steps/medical-info-step.tsx`)

Per emergency contact card:
- Add a Select at the top: "Selecionar responsavel" with the registered responsibles as options.
- On select: fill name/phone/relationship from the responsible, disable those fields, store `responsibleUserId` and `responsibleIndex`.
- On clear: re-enable fields, clear values, remove `responsibleUserId`.
- Responsibles already used in another contact are disabled in the dropdown.
- Watch `responsibles` from form: sync data changes, clear contacts whose responsible was removed.

### Edit Student Modal

Apply the same pattern to `inertia/containers/students/edit-student-modal/`.
