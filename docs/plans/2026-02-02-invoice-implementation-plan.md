# Invoice (Fatura) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create an Invoice model that aggregates StudentPayments into a single billable unit per student, with support for both MONTHLY and UPFRONT contract types.

**Architecture:** New `Invoice` table + `invoiceId` FK on `StudentPayment` + `studentPaymentId` FK on `CanteenPurchase` and `StoreOrder`. No existing table structures change — only new columns added.

**Tech Stack:** AdonisJS 6 + Lucid ORM, PostgreSQL, VineJS validators

**Design doc:** `docs/plans/2026-02-02-invoice-aggregation-design.md`

---

### Task 1: Create InvoiceStatus and InvoiceType enums

**Files:**
- Create: `database/migrations/1768500126000_create_invoice_enums.ts`

**Step 1: Write the migration**

```typescript
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "InvoiceStatus" AS ENUM ('OPEN', 'PENDING', 'PAID', 'OVERDUE', 'CANCELLED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "InvoiceType" AS ENUM ('MONTHLY', 'UPFRONT');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)
  }

  async down() {
    await this.db.rawQuery('DROP TYPE IF EXISTS "InvoiceStatus" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "InvoiceType" CASCADE')
  }
}
```

**Step 2: Run migration**

Run: `node ace migration:run`
Expected: Migration runs successfully

**Step 3: Commit**

```
feat: add InvoiceStatus and InvoiceType enums
```

---

### Task 2: Create Invoice table migration

**Files:**
- Create: `database/migrations/1768500127000_create_invoice_table.ts`

**Step 1: Write the migration**

```typescript
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Invoice'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()

      table
        .text('studentId')
        .notNullable()
        .references('id')
        .inTable('Student')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')

      table
        .text('contractId')
        .notNullable()
        .references('id')
        .inTable('Contract')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')

      table.specificType('type', '"InvoiceType"').notNullable()
      table.integer('month').nullable()
      table.integer('year').nullable()
      table.date('dueDate').notNullable()
      table.specificType('status', '"InvoiceStatus"').notNullable().defaultTo('OPEN')
      table.integer('totalAmount').notNullable()
      table.integer('netAmountReceived').nullable()
      table.timestamp('paidAt').nullable()
      table.text('paymentMethod').nullable()
      table.text('paymentGatewayId').nullable().unique()
      table.text('paymentGateway').nullable()
      table.text('observation').nullable()

      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()

      table.index(['studentId', 'month', 'year'])
      table.index(['contractId'])
      table.index(['status'])
      table.index(['paymentGatewayId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

**Step 2: Run migration**

Run: `node ace migration:run`
Expected: Invoice table created

**Step 3: Commit**

```
feat: create Invoice table migration
```

---

### Task 3: Add invoiceId to StudentPayment

**Files:**
- Create: `database/migrations/1768500128000_add_invoice_id_to_student_payment.ts`

**Step 1: Write the migration**

```typescript
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'StudentPayment'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .text('invoiceId')
        .nullable()
        .references('id')
        .inTable('Invoice')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('invoiceId')
    })
  }
}
```

**Step 2: Run migration**

Run: `node ace migration:run`
Expected: `invoiceId` column added to StudentPayment

**Step 3: Commit**

```
feat: add invoiceId column to StudentPayment
```

---

### Task 4: Add studentPaymentId to CanteenPurchase and StoreOrder

**Files:**
- Create: `database/migrations/1768500129000_add_student_payment_id_to_canteen_and_store.ts`

**Step 1: Write the migration**

```typescript
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('CanteenPurchase', (table) => {
      table
        .text('studentPaymentId')
        .nullable()
        .references('id')
        .inTable('StudentPayment')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
    })

    this.schema.alterTable('StoreOrder', (table) => {
      table
        .text('studentPaymentId')
        .nullable()
        .references('id')
        .inTable('StudentPayment')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
    })
  }

  async down() {
    this.schema.alterTable('CanteenPurchase', (table) => {
      table.dropColumn('studentPaymentId')
    })

    this.schema.alterTable('StoreOrder', (table) => {
      table.dropColumn('studentPaymentId')
    })
  }
}
```

**Step 2: Run migration**

Run: `node ace migration:run`
Expected: `studentPaymentId` column added to both tables

**Step 3: Commit**

```
feat: add studentPaymentId to CanteenPurchase and StoreOrder
```

---

### Task 5: Create Invoice model

**Files:**
- Create: `app/models/invoice.ts`

**Step 1: Write the model**

```typescript
import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, hasMany, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Student from './student.js'
import Contract from './contract.js'
import StudentPayment from './student_payment.js'

export default class Invoice extends BaseModel {
  static table = 'Invoice'

  @beforeCreate()
  static assignId(model: Invoice) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'studentId' })
  declare studentId: string

  @column({ columnName: 'contractId' })
  declare contractId: string

  @column({ columnName: 'type' })
  declare type: 'MONTHLY' | 'UPFRONT'

  @column({ columnName: 'month' })
  declare month: number | null

  @column({ columnName: 'year' })
  declare year: number | null

  @column.date({ columnName: 'dueDate' })
  declare dueDate: DateTime

  @column({ columnName: 'status' })
  declare status: 'OPEN' | 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'

  @column({ columnName: 'totalAmount' })
  declare totalAmount: number

  @column({ columnName: 'netAmountReceived' })
  declare netAmountReceived: number | null

  @column.dateTime({ columnName: 'paidAt' })
  declare paidAt: DateTime | null

  @column({ columnName: 'paymentMethod' })
  declare paymentMethod: 'PIX' | 'BOLETO' | 'CREDIT_CARD' | 'CASH' | 'OTHER' | null

  @column({ columnName: 'paymentGatewayId' })
  declare paymentGatewayId: string | null

  @column({ columnName: 'paymentGateway' })
  declare paymentGateway: 'ASAAS' | 'CUSTOM' | null

  @column({ columnName: 'observation' })
  declare observation: string | null

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => Contract, { foreignKey: 'contractId' })
  declare contract: BelongsTo<typeof Contract>

  @hasMany(() => StudentPayment, { foreignKey: 'invoiceId' })
  declare payments: HasMany<typeof StudentPayment>
}
```

**Step 2: Commit**

```
feat: create Invoice model
```

---

### Task 6: Update StudentPayment model with invoiceId

**Files:**
- Modify: `app/models/student_payment.ts`

**Step 1: Add Invoice import and relationship**

Add import at the top (after Contract import):
```typescript
import Invoice from './invoice.js'
```

Add column after `agreementId`:
```typescript
  @column({ columnName: 'invoiceId' })
  declare invoiceId: string | null
```

Add relationship after the `contract` relationship:
```typescript
  @belongsTo(() => Invoice, { foreignKey: 'invoiceId' })
  declare invoice: BelongsTo<typeof Invoice>
```

**Step 2: Commit**

```
feat: add invoiceId relationship to StudentPayment model
```

---

### Task 7: Update CanteenPurchase model with studentPaymentId

**Files:**
- Modify: `app/models/canteen_purchase.ts`

**Step 1: Add import and relationship**

Add import:
```typescript
import StudentPayment from './student_payment.js'
```

Add column:
```typescript
  @column()
  declare studentPaymentId: string | null
```

Add relationship:
```typescript
  @belongsTo(() => StudentPayment, { foreignKey: 'studentPaymentId' })
  declare studentPayment: BelongsTo<typeof StudentPayment>
```

Note: Check if `belongsTo` and `BelongsTo` are already imported. If not, add them to the existing import line.

**Step 2: Commit**

```
feat: add studentPaymentId to CanteenPurchase model
```

---

### Task 8: Update StoreOrder model with studentPaymentId

**Files:**
- Modify: `app/models/store_order.ts`

**Step 1: Add import and relationship**

Add import:
```typescript
import StudentPayment from './student_payment.js'
```

Add column:
```typescript
  @column({ columnName: 'studentPaymentId' })
  declare studentPaymentId: string | null
```

Add relationship:
```typescript
  @belongsTo(() => StudentPayment, { foreignKey: 'studentPaymentId' })
  declare studentPayment: BelongsTo<typeof StudentPayment>
```

Note: Check if `belongsTo` and `BelongsTo` are already imported. If not, add them.

**Step 2: Commit**

```
feat: add studentPaymentId to StoreOrder model
```

---

### Task 9: Create Invoice validator

**Files:**
- Create: `app/validators/invoice.ts`

**Step 1: Write the validator**

```typescript
import vine from '@vinejs/vine'

export const listInvoicesValidator = vine.compile(
  vine.object({
    studentId: vine.string().trim().optional(),
    contractId: vine.string().trim().optional(),
    status: vine
      .enum(['OPEN', 'PENDING', 'PAID', 'OVERDUE', 'CANCELLED'])
      .optional(),
    type: vine.enum(['MONTHLY', 'UPFRONT']).optional(),
    month: vine.number().min(1).max(12).optional(),
    year: vine.number().min(2020).max(2100).optional(),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)

export const markInvoicePaidValidator = vine.compile(
  vine.object({
    paymentMethod: vine.enum(['PIX', 'BOLETO', 'CREDIT_CARD', 'CASH', 'OTHER']),
    netAmountReceived: vine.number().min(0),
    observation: vine.string().trim().optional(),
  })
)
```

**Step 2: Commit**

```
feat: create Invoice validators
```

---

### Task 10: Create ListInvoicesController

**Files:**
- Create: `app/controllers/invoices/list_invoices_controller.ts`

**Step 1: Write the controller**

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import Invoice from '#models/invoice'
import { listInvoicesValidator } from '#validators/invoice'

export default class ListInvoicesController {
  async handle(ctx: HttpContext) {
    const { request, response, selectedSchoolIds } = ctx
    const payload = await request.validateUsing(listInvoicesValidator)

    const {
      studentId,
      contractId,
      status,
      type,
      month,
      year,
      page = 1,
      limit = 20,
    } = payload

    const query = Invoice.query()
      .preload('student', (q) => q.preload('user'))
      .preload('payments')
      .orderBy('dueDate', 'desc')

    if (selectedSchoolIds && selectedSchoolIds.length > 0) {
      query.whereHas('contract', (q) => {
        q.whereIn('schoolId', selectedSchoolIds)
      })
    }

    if (studentId) {
      query.where('studentId', studentId)
    }

    if (contractId) {
      query.where('contractId', contractId)
    }

    if (status) {
      query.where('status', status)
    }

    if (type) {
      query.where('type', type)
    }

    if (month) {
      query.where('month', month)
    }

    if (year) {
      query.where('year', year)
    }

    const invoices = await query.paginate(page, limit)

    return response.ok(invoices)
  }
}
```

**Step 2: Commit**

```
feat: create ListInvoicesController
```

---

### Task 11: Create MarkInvoicePaidController

**Files:**
- Create: `app/controllers/invoices/mark_invoice_paid_controller.ts`

**Step 1: Write the controller**

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import Invoice from '#models/invoice'
import { markInvoicePaidValidator } from '#validators/invoice'

export default class MarkInvoicePaidController {
  async handle({ request, response, params }: HttpContext) {
    const payload = await request.validateUsing(markInvoicePaidValidator)
    const invoice = await Invoice.findOrFail(params.id)

    if (invoice.status === 'PAID') {
      return response.conflict({ message: 'Invoice já está paga' })
    }

    if (invoice.status === 'CANCELLED') {
      return response.conflict({ message: 'Invoice está cancelada' })
    }

    const trx = await db.transaction()

    try {
      invoice.useTransaction(trx)
      invoice.status = 'PAID'
      invoice.paidAt = DateTime.now()
      invoice.paymentMethod = payload.paymentMethod
      invoice.netAmountReceived = payload.netAmountReceived
      invoice.observation = payload.observation ?? null
      await invoice.save()

      // Propagate PAID to all linked StudentPayments
      await trx
        .from('StudentPayment')
        .where('invoiceId', invoice.id)
        .whereNot('status', 'CANCELLED')
        .update({
          status: 'PAID',
          paidAt: DateTime.now().toSQL(),
          updatedAt: DateTime.now().toSQL(),
        })

      await trx.commit()

      await invoice.load('payments')

      return response.ok(invoice)
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
```

**Step 2: Commit**

```
feat: create MarkInvoicePaidController
```

---

### Task 12: Register Invoice routes

**Files:**
- Modify: `start/routes.ts`

**Step 1: Add controller imports**

Near the other controller imports (around line 386), add:
```typescript
const ListInvoicesController = () =>
  import('#controllers/invoices/list_invoices_controller')
const MarkInvoicePaidController = () =>
  import('#controllers/invoices/mark_invoice_paid_controller')
```

**Step 2: Add route registration function**

After `registerAgreementApiRoutes()` (around line 1450), add:
```typescript
function registerInvoiceApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListInvoicesController]).as('invoices.index')
      router.post('/:id/mark-paid', [MarkInvoicePaidController]).as('invoices.markPaid')
    })
    .prefix('/invoices')
    .use([middleware.auth(), middleware.impersonation()])
}
```

**Step 3: Call the function**

Find where `registerStudentPaymentApiRoutes()` and `registerAgreementApiRoutes()` are called (around line 2740) and add:
```typescript
    registerInvoiceApiRoutes()
```

**Step 4: Commit**

```
feat: register Invoice API routes
```

---

### Task 13: Run all migrations and verify

**Step 1: Run migrations**

Run: `node ace migration:run`
Expected: All 4 new migrations run successfully

**Step 2: Verify tables exist**

Run: `node ace repl` then check Invoice table exists, or verify via a quick curl/test.

**Step 3: Commit (if any adjustments needed)**

---
