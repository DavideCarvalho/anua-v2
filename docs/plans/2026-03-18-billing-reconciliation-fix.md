# Billing Reconciliation Fix Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix BillingReconciliationService to group payments by enrollment and handle orphan enrollments from deleted academic periods.

**Architecture:** Add `studentHasLevelId` to Invoice model. Modify `resolveTargetInvoice` to validate enrollment period. Add `cleanupOrphanPayments` to handle orphan payments. Add `ReconcileOptions` parameter to all public methods.

**Tech Stack:** AdonisJS, Lucid ORM, PostgreSQL, Japa tests

---

## Task 1: Add studentHasLevelId to Invoice Model

**Files:**

- Create: `database/migrations/YYYYMMDDHHMMSS_add_student_has_level_id_to_invoice.ts`
- Modify: `app/models/invoice.ts`

**Step 1: Create migration**

```typescript
// database/migrations/1742300000000_add_student_has_level_id_to_invoice.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Invoice'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .text('studentHasLevelId')
        .nullable()
        .references('id')
        .inTable('StudentHasLevel')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')

      table.index(['studentHasLevelId'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(['studentHasLevelId'])
      table.dropColumn('studentHasLevelId')
    })
  }
}
```

**Step 2: Run migration**

Run: `node ace migration:run`
Expected: Migration applied successfully

**Step 3: Update Invoice model**

Add to `app/models/invoice.ts` after `studentId`:

```typescript
@column({ columnName: 'studentHasLevelId' })
declare studentHasLevelId: string | null

@belongsTo(() => StudentHasLevel, { foreignKey: 'studentHasLevelId' })
declare enrollment: BelongsTo<typeof StudentHasLevel>
```

Add import:

```typescript
import StudentHasLevel from './student_has_level.js'
```

**Step 4: Verify model compiles**

Run: `node ace build`
Expected: No errors

**Step 5: Commit**

```bash
git add database/migrations/1742300000000_add_student_has_level_id_to_invoice.ts app/models/invoice.ts
git commit -m "feat: add studentHasLevelId to Invoice model"
```

---

## Task 2: Write Tests for resolveTargetInvoice

**Files:**

- Create: `tests/functional/billing/billing_reconciliation_service.spec.ts`

**Step 1: Create test file with setup**

```typescript
// tests/functional/billing/billing_reconciliation_service.spec.ts
import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import BillingReconciliationService from '#services/payments/billing_reconciliation_service'
import Student from '#models/student'
import StudentHasLevel from '#models/student_has_level'
import StudentPayment from '#models/student_payment'
import Invoice from '#models/invoice'
import AcademicPeriod from '#models/academic_period'
import Level from '#models/level'
import Contract from '#models/contract'
import School from '#models/school'
import User from '#models/user'

test.group('BillingReconciliationService', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  // Tests go here
})
```

**Step 2: Write test - returns null for orphan enrollment**

```typescript
test('resolveTargetInvoice returns null for payment from orphan enrollment', async ({ assert }) => {
  // Create school and user
  const school = await School.create({ name: 'Test School' })
  const user = await User.create({
    name: 'Test Student',
    email: 'test@test.com',
    password: 'password',
    schoolId: school.id,
  })

  // Create student
  const student = await Student.create({
    id: user.id,
    descountPercentage: 0,
    monthlyPaymentAmount: 0,
    isSelfResponsible: false,
    balance: 0,
  })

  // Create deleted academic period
  const period = await AcademicPeriod.create({
    name: 'Deleted Period',
    startDate: DateTime.now().minus({ months: 6 }),
    endDate: DateTime.now().minus({ months: 2 }),
    schoolId: school.id,
    isActive: false,
    deletedAt: DateTime.now().minus({ months: 1 }),
  })

  // Create level and contract
  const level = await Level.create({ name: 'Test Level', schoolId: school.id })
  const contract = await Contract.create({
    ammount: 100000,
    paymentType: 'MONTHLY',
    installments: 12,
  })

  // Create enrollment linked to deleted period
  const enrollment = await StudentHasLevel.create({
    studentId: student.id,
    levelId: level.id,
    academicPeriodId: period.id,
    contractId: contract.id,
  })

  // Create payment
  const payment = await StudentPayment.create({
    studentId: student.id,
    studentHasLevelId: enrollment.id,
    contractId: contract.id,
    type: 'TUITION',
    amount: 10000,
    totalAmount: 10000,
    month: DateTime.now().month,
    year: DateTime.now().year,
    dueDate: DateTime.now().plus({ days: 10 }),
    status: 'PENDING',
  })

  // Call resolveTargetInvoice
  const invoice = await BillingReconciliationService['resolveTargetInvoice'](payment)

  assert.isNull(invoice, 'Should return null for orphan enrollment payment')
})
```

**Step 3: Run test to verify it fails**

Run: `node ace test tests/functional/billing/billing_reconciliation_service.spec.ts`
Expected: FAIL - method not working correctly

**Step 4: Write test - groups by enrollment not just student**

```typescript
test('resolveTargetInvoice creates separate invoices for different enrollments', async ({
  assert,
}) => {
  // Create school and user
  const school = await School.create({ name: 'Test School' })
  const user = await User.create({
    name: 'Test Student 2',
    email: 'test2@test.com',
    password: 'password',
    schoolId: school.id,
  })

  const student = await Student.create({
    id: user.id,
    descountPercentage: 0,
    monthlyPaymentAmount: 0,
    isSelfResponsible: false,
    balance: 0,
  })

  // Create active period
  const period = await AcademicPeriod.create({
    name: 'Active Period',
    startDate: DateTime.now().startOf('year'),
    endDate: DateTime.now().endOf('year'),
    schoolId: school.id,
    isActive: true,
  })

  // Create level and contracts
  const level = await Level.create({ name: 'Test Level 2', schoolId: school.id })
  const contract1 = await Contract.create({
    ammount: 100000,
    paymentType: 'MONTHLY',
    installments: 12,
  })
  const contract2 = await Contract.create({
    ammount: 200000,
    paymentType: 'MONTHLY',
    installments: 12,
  })

  // Create two enrollments
  const enrollment1 = await StudentHasLevel.create({
    studentId: student.id,
    levelId: level.id,
    academicPeriodId: period.id,
    contractId: contract1.id,
  })

  const enrollment2 = await StudentHasLevel.create({
    studentId: student.id,
    levelId: level.id,
    academicPeriodId: period.id,
    contractId: contract2.id,
  })

  const month = DateTime.now().month
  const year = DateTime.now().year

  // Create payments for same month but different enrollments
  const payment1 = await StudentPayment.create({
    studentId: student.id,
    studentHasLevelId: enrollment1.id,
    contractId: contract1.id,
    type: 'TUITION',
    amount: 10000,
    totalAmount: 10000,
    month,
    year,
    dueDate: DateTime.now().plus({ days: 10 }),
    status: 'PENDING',
  })

  const payment2 = await StudentPayment.create({
    studentId: student.id,
    studentHasLevelId: enrollment2.id,
    contractId: contract2.id,
    type: 'TUITION',
    amount: 20000,
    totalAmount: 20000,
    month,
    year,
    dueDate: DateTime.now().plus({ days: 10 }),
    status: 'PENDING',
  })

  // Resolve invoices
  const invoice1 = await BillingReconciliationService['resolveTargetInvoice'](payment1)
  const invoice2 = await BillingReconciliationService['resolveTargetInvoice'](payment2)

  assert.isNotNull(invoice1)
  assert.isNotNull(invoice2)
  assert.notEqual(invoice1!.id, invoice2!.id, 'Should create separate invoices')
  assert.equal(invoice1!.studentHasLevelId, enrollment1.id)
  assert.equal(invoice2!.studentHasLevelId, enrollment2.id)
})
```

**Step 5: Commit test file**

```bash
git add tests/functional/billing/billing_reconciliation_service.spec.ts
git commit -m "test: add tests for BillingReconciliationService orphan enrollment handling"
```

---

## Task 3: Implement resolveTargetInvoice Changes

**Files:**

- Modify: `app/services/payments/billing_reconciliation_service.ts`

**Step 1: Add ReconcileOptions interface**

Add at top of file after imports:

```typescript
interface ReconcileOptions {
  keepUnpaidBeforePeriodClose?: boolean
}
```

**Step 2: Modify resolveTargetInvoice signature and implementation**

Replace the entire `resolveTargetInvoice` method (lines 209-254):

```typescript
private static async resolveTargetInvoice(
  payment: StudentPayment,
  options?: ReconcileOptions
): Promise<Invoice | null> {
  // 1. Se já tem invoice válido, retorna
  const existingByPayment = payment.invoiceId
    ? await Invoice.query()
        .where('id', payment.invoiceId)
        .whereNotIn('status', [...FINAL_INVOICE_STATUSES])
        .first()
    : null

  if (existingByPayment) {
    return existingByPayment
  }

  // 2. Valida se a matrícula tem período acadêmico válido
  if (payment.studentHasLevelId) {
    const enrollment = await StudentHasLevel.query()
      .where('id', payment.studentHasLevelId)
      .preload('academicPeriod', (q) => q.whereNull('deletedAt').where('isActive', true))
      .first()

    if (!enrollment?.academicPeriod) {
      return null
    }
  }

  // 3. Busca invoice existente pela matrícula
  const existingByEnrollment = payment.studentHasLevelId
    ? await Invoice.query()
        .where('studentId', payment.studentId)
        .where('studentHasLevelId', payment.studentHasLevelId)
        .where('month', payment.month)
        .where('year', payment.year)
        .whereNotIn('status', ['CANCELLED', 'RENEGOTIATED'])
        .first()
    : null

  if (existingByEnrollment) {
    return existingByEnrollment
  }

  // 4. Validação para matrículas sem studentHasLevelId (payments órfãos antigos)
  if (!payment.studentHasLevelId) {
    const existingByStudentPeriod = await Invoice.query()
      .where('studentId', payment.studentId)
      .where('month', payment.month)
      .where('year', payment.year)
      .whereNull('studentHasLevelId')
      .whereNotIn('status', ['CANCELLED', 'RENEGOTIATED'])
      .first()

    if (existingByStudentPeriod) {
      return existingByStudentPeriod
    }
  }

  // 5. Cria novo invoice
  return Invoice.create({
    studentId: payment.studentId,
    studentHasLevelId: payment.studentHasLevelId,
    contractId: payment.contractId ?? null,
    type: 'MONTHLY',
    month: payment.month,
    year: payment.year,
    dueDate: payment.dueDate,
    status: 'OPEN',
    baseAmount: 0,
    discountAmount: 0,
    fineAmount: 0,
    interestAmount: 0,
    totalAmount: 0,
  })
}
```

**Step 3: Run tests**

Run: `node ace test tests/functional/billing/billing_reconciliation_service.spec.ts`
Expected: Tests PASS

**Step 4: Commit**

```bash
git add app/services/payments/billing_reconciliation_service.ts
git commit -m "fix: validate enrollment period in resolveTargetInvoice"
```

---

## Task 4: Implement cleanupOrphanPayments

**Files:**

- Modify: `app/services/payments/billing_reconciliation_service.ts`

**Step 1: Add cleanupOrphanPayments method**

Add new private method after `resolveTargetInvoice`:

```typescript
private static async cleanupOrphanPayments(
  studentId: string,
  options?: ReconcileOptions
): Promise<void> {
  const keepUnpaid = options?.keepUnpaidBeforePeriodClose ?? false

  // Busca payments de matrículas com período deletado/inativo
  const orphanPayments = await StudentPayment.query()
    .where('studentId', studentId)
    .whereNotNull('studentHasLevelId')
    .whereNotIn('status', ['CANCELLED', 'RENEGOTIATED'])
    .preload('enrollment', (q) => {
      q.preload('academicPeriod')
    })

  for (const payment of orphanPayments) {
    const period = payment.enrollment?.academicPeriod

    // Se período é válido, não é órfão
    if (period && !period.deletedAt && period.isActive) {
      continue
    }

    // PAGOS sempre mantém
    if (payment.status === 'PAID') {
      continue
    }

    // Verifica se é anterior ao fechamento do período
    if (keepUnpaid && period?.deletedAt) {
      const periodClosedAt = DateTime.fromJSDate(period.deletedAt as unknown as Date)
      if (payment.dueDate < periodClosedAt) {
        continue // Manter se opção ativada e venceu antes
      }
    }

    // Cancelar payment e desvincular
    payment.status = 'CANCELLED'
    payment.invoiceId = null
    payment.metadata = {
      ...payment.metadata,
      cancelReason: 'Matrícula desativada - período acadêmico encerrado',
    }
    await payment.save()
  }

  // Deletar invoices órfãos (sem payments ativos)
  await Invoice.query()
    .where('studentId', studentId)
    .whereNotIn('status', ['PAID', 'CANCELLED', 'RENEGOTIATED'])
    .whereDoesntHave('payments', (q) => {
      q.whereNotIn('status', ['CANCELLED', 'RENEGOTIATED'])
    })
    .delete()
}
```

**Step 2: Write test for cleanupOrphanPayments**

Add to test file:

```typescript
test('cleanupOrphanPayments cancels unpaid payments from deleted period', async ({ assert }) => {
  const school = await School.create({ name: 'Test School' })
  const user = await User.create({
    name: 'Test Student 3',
    email: 'test3@test.com',
    password: 'password',
    schoolId: school.id,
  })

  const student = await Student.create({
    id: user.id,
    descountPercentage: 0,
    monthlyPaymentAmount: 0,
    isSelfResponsible: false,
    balance: 0,
  })

  // Create deleted period
  const period = await AcademicPeriod.create({
    name: 'Deleted Period 2',
    startDate: DateTime.now().minus({ months: 6 }),
    endDate: DateTime.now().minus({ months: 2 }),
    schoolId: school.id,
    isActive: false,
    deletedAt: DateTime.now().minus({ months: 1 }),
  })

  const level = await Level.create({ name: 'Test Level 3', schoolId: school.id })
  const contract = await Contract.create({
    ammount: 100000,
    paymentType: 'MONTHLY',
    installments: 12,
  })

  const enrollment = await StudentHasLevel.create({
    studentId: student.id,
    levelId: level.id,
    academicPeriodId: period.id,
    contractId: contract.id,
  })

  // Create paid and unpaid payments
  const paidPayment = await StudentPayment.create({
    studentId: student.id,
    studentHasLevelId: enrollment.id,
    contractId: contract.id,
    type: 'TUITION',
    amount: 10000,
    totalAmount: 10000,
    month: DateTime.now().minus({ months: 3 }).month,
    year: DateTime.now().year,
    dueDate: DateTime.now().minus({ months: 3 }),
    status: 'PAID',
  })

  const unpaidPayment = await StudentPayment.create({
    studentId: student.id,
    studentHasLevelId: enrollment.id,
    contractId: contract.id,
    type: 'TUITION',
    amount: 10000,
    totalAmount: 10000,
    month: DateTime.now().plus({ months: 1 }).month,
    year: DateTime.now().year,
    dueDate: DateTime.now().plus({ months: 1 }),
    status: 'PENDING',
  })

  // Run cleanup
  await BillingReconciliationService['cleanupOrphanPayments'](student.id)

  // Reload payments
  await paidPayment.refresh()
  await unpaidPayment.refresh()

  assert.equal(paidPayment.status, 'PAID', 'Paid payment should remain PAID')
  assert.equal(unpaidPayment.status, 'CANCELLED', 'Unpaid payment should be CANCELLED')
})
```

**Step 3: Run tests**

Run: `node ace test tests/functional/billing/billing_reconciliation_service.spec.ts`
Expected: All tests PASS

**Step 4: Commit**

```bash
git add app/services/payments/billing_reconciliation_service.ts tests/functional/billing/billing_reconciliation_service.spec.ts
git commit -m "feat: add cleanupOrphanPayments to handle orphan payments"
```

---

## Task 5: Update Public Method Signatures

**Files:**

- Modify: `app/services/payments/billing_reconciliation_service.ts`

**Step 1: Update reconcileByPaymentId**

Update signature and call cleanup:

```typescript
static async reconcileByPaymentId(
  paymentId: string,
  options?: ReconcileOptions
): Promise<void> {
  const payment = await StudentPayment.find(paymentId)
  if (!payment) return

  if (payment.type === 'AGREEMENT') return

  const runReconciliation = async () => {
    // Cleanup orphan payments first
    await this.cleanupOrphanPayments(payment.studentId, options)

    await payment.refresh()

    if (payment.type === 'AGREEMENT') return

    const invoice = await this.resolveTargetInvoice(payment, options)
    if (!invoice) {
      return
    }

    if (
      !INACTIVE_PAYMENT_STATUSES.includes(
        payment.status as (typeof INACTIVE_PAYMENT_STATUSES)[number]
      )
    ) {
      if (payment.invoiceId !== invoice.id) {
        payment.invoiceId = invoice.id
        await payment.save()
      }
    }

    await this.reconcileByInvoiceId(invoice.id, options)
  }

  // ... rest of lock logic stays the same
}
```

**Step 2: Update reconcileByInvoiceId**

```typescript
static async reconcileByInvoiceId(
  invoiceId: string,
  options?: ReconcileOptions
): Promise<InvoiceReconciliationResult> {
  // ... existing implementation, pass options to internal calls if needed
}
```

**Step 3: Update reconcileByEnrollmentId**

```typescript
static async reconcileByEnrollmentId(
  enrollmentId: string,
  options?: ReconcileOptions
): Promise<void> {
  const enrollment = await StudentHasLevel.find(enrollmentId)
  if (!enrollment) return

  const payments = await StudentPayment.query()
    .where((query) => {
      query.where('studentHasLevelId', enrollment.id).orWhere((subQuery) => {
        subQuery.where('studentId', enrollment.studentId).whereNull('studentHasLevelId')
      })
    })
    .whereNotIn('status', [...INACTIVE_PAYMENT_STATUSES])
    .whereNotIn('type', ['AGREEMENT'])
    .orderBy('year', 'asc')
    .orderBy('month', 'asc')

  for (const payment of payments) {
    await this.reconcileByPaymentId(payment.id, options)
  }
}
```

**Step 4: Run all tests**

Run: `node ace test`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add app/services/payments/billing_reconciliation_service.ts
git commit -m "feat: add ReconcileOptions to all public methods"
```

---

## Task 6: Update UpdateEnrollmentPaymentsJob

**Files:**

- Modify: `app/jobs/payments/update_enrollment_payments_job.ts`

**Step 1: Update reconcileInvoices call**

Find line ~297:

```typescript
await BillingReconciliationService.reconcileByInvoiceId(invoice.id)
```

Change to:

```typescript
await BillingReconciliationService.reconcileByInvoiceId(invoice.id, {
  keepUnpaidBeforePeriodClose: false,
})
```

Find line ~322:

```typescript
await BillingReconciliationService.reconcileByPaymentId(payment.id)
```

Change to:

```typescript
await BillingReconciliationService.reconcileByPaymentId(payment.id, {
  keepUnpaidBeforePeriodClose: false,
})
```

**Step 2: Commit**

```bash
git add app/jobs/payments/update_enrollment_payments_job.ts
git commit -m "fix: pass ReconcileOptions to billing reconciliation calls"
```

---

## Task 7: Run Full Test Suite

**Step 1: Run all tests**

Run: `node ace test`
Expected: All tests PASS

**Step 2: Check types**

Run: `node ace build`
Expected: No errors

**Step 3: Final commit**

```bash
git add .
git commit -m "feat: complete billing reconciliation fix for orphan enrollments"
```

---

## Verification Commands

After implementation, verify with:

```bash
# Check for invoices with multiple active TUITION payments
node ace command

# Or direct SQL:
psql -c "SELECT i.id, COUNT(sp.id) as tuition_count FROM \"Invoice\" i JOIN \"StudentPayment\" sp ON sp.\"invoiceId\" = i.id WHERE sp.type = 'TUITION' AND sp.status NOT IN ('CANCELLED', 'RENEGOTIATED') GROUP BY i.id HAVING COUNT(sp.id) > 1;"
```
