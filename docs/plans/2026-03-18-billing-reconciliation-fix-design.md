# Billing Reconciliation Fix - Design

## Problem

The `BillingReconciliationService` groups payments by `studentId + month + year`, ignoring `studentHasLevelId`. When a student has multiple enrollments (e.g., from different academic periods), payments from different enrollments are incorrectly linked to the same invoice, causing duplicate monthly charges.

### Root Cause

1. Academic periods get deactivated/deleted, but enrollments remain active
2. New enrollment created in new academic period
3. `BillingReconciliationService.resolveTargetInvoice` ignores `academicPeriodId` and groups all payments into one invoice

### Real Example

Student DAVI RICHARD FERREIRA EUGÊNIO:

- Enrollment A (period deleted 2026-02-05): 11 active payments
- Enrollment B (period active): 11 active payments
- Both merged into same invoices, showing R$ 132.000 instead of separate charges

## Solution

### 1. New Parameter

```ts
interface ReconcileOptions {
  keepUnpaidBeforePeriodClose?: boolean // default: false
}
```

### 2. Modified `resolveTargetInvoice`

- Validates enrollment has active, non-deleted academic period
- Groups by `studentId + studentHasLevelId + month + year` (not just studentId)
- Creates invoice linked to enrollment

### 3. New `cleanupOrphanPayments` Function

Handles payments from orphan enrollments (enrollment with deleted/inactive academic period):

- **PAID payments**: Always keep (financial history)
- **UNPAID payments before period closed**: Optional (parameter `keepUnpaidBeforePeriodClose`)
- **UNPAID payments after period closed**: Always cancel
- Delete orphan invoices (invoices with no active payments)

### 4. Cleanup Logic

```
Payment Status     | Period Status | Before Closed? | Action
-------------------|---------------|----------------|--------
PAID               | deleted       | any            | KEEP
NOT_PAID/PENDING   | deleted       | yes            | OPTION (default: cancel)
NOT_PAID/PENDING   | deleted       | no             | CANCEL
```

## Changes Required

### Files to Modify

1. `app/services/payments/billing_reconciliation_service.ts`
   - Add `ReconcileOptions` interface
   - Modify `resolveTargetInvoice` to validate enrollment period
   - Add `cleanupOrphanPayments` private method
   - Update `reconcileByPaymentId`, `reconcileByInvoiceId`, `reconcileByEnrollmentId` signatures

2. `app/models/invoice.ts`
   - Add `studentHasLevelId` column if not exists

### Tests Required

1. Unit tests for `resolveTargetInvoice`:
   - Returns null for orphan enrollment payment
   - Groups by enrollment, not just student
   - Creates invoice with correct `studentHasLevelId`

2. Unit tests for `cleanupOrphanPayments`:
   - Keeps paid payments from orphan enrollments
   - Cancels unpaid payments after period close
   - Respects `keepUnpaidBeforePeriodClose` option
   - Deletes orphan invoices

3. Integration tests:
   - Full reconciliation flow with multiple enrollments
   - Cleanup + new invoice creation
