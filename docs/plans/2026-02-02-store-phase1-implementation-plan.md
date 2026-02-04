# Store System Phase 1 -- Foundation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create the database foundations (StoreInstallmentRule, WalletTopUp, PlatformSettings update) and admin frontend for managing stores, their products, installment rules, financial settings, and settlements.

**Architecture:** New migrations + models for StoreInstallmentRule and WalletTopUp. Alter PlatformSettings and StoreFinancialSettings. New Inertia pages under `/escola/lojas` using existing EscolaLayout with tab-based store detail page.

**Tech Stack:** AdonisJS 6 + Lucid ORM, PostgreSQL, VineJS, React + Inertia.js, shadcn/ui components

**Design doc:** `docs/plans/2026-02-02-store-system-design.md`

---

### Task 1: Create WalletTopUpStatus enum migration

**Files:**
- Create: `database/migrations/1768500138000_create_wallet_top_up_status_enum.ts`

**Step 1: Write the migration**

```typescript
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "WalletTopUpStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELLED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)
  }

  async down() {
    await this.db.rawQuery('DROP TYPE IF EXISTS "WalletTopUpStatus" CASCADE')
  }
}
```

**Step 2: Commit**

```
feat: add WalletTopUpStatus enum migration
```

---

### Task 2: Create WalletTopUp table migration

**Files:**
- Create: `database/migrations/1768500139000_create_wallet_top_up_table.ts`

**Step 1: Write the migration**

```typescript
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'WalletTopUp'

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
        .text('responsibleUserId')
        .notNullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')

      table.integer('amount').notNullable()
      table.specificType('status', '"WalletTopUpStatus"').notNullable().defaultTo('PENDING')
      table.text('paymentGateway').notNullable().defaultTo('ASAAS')
      table.text('paymentGatewayId').nullable().unique()
      table.text('paymentMethod').nullable()
      table.timestamp('paidAt').nullable()

      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()

      table.index(['studentId'])
      table.index(['responsibleUserId'])
      table.index(['status'])
      table.index(['paymentGatewayId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

**Step 2: Commit**

```
feat: create WalletTopUp table migration
```

---

### Task 3: Create StoreInstallmentRule table migration

**Files:**
- Create: `database/migrations/1768500140000_create_store_installment_rule_table.ts`

**Step 1: Write the migration**

```typescript
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'StoreInstallmentRule'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()

      table
        .text('storeId')
        .notNullable()
        .references('id')
        .inTable('Store')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')

      table.integer('minAmount').notNullable()
      table.integer('maxInstallments').notNullable()
      table.boolean('isActive').notNullable().defaultTo(true)

      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()

      table.index(['storeId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

**Step 2: Commit**

```
feat: create StoreInstallmentRule table migration
```

---

### Task 4: Add defaultStorePlatformFeePercentage to PlatformSettings

**Files:**
- Create: `database/migrations/1768500141000_add_default_store_fee_to_platform_settings.ts`

**Step 1: Write the migration**

```typescript
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'PlatformSettings'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.float('defaultStorePlatformFeePercentage', 8).notNullable().defaultTo(5.0)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('defaultStorePlatformFeePercentage')
    })
  }
}
```

**Step 2: Commit**

```
feat: add defaultStorePlatformFeePercentage to PlatformSettings
```

---

### Task 5: Make StoreFinancialSettings.platformFeePercentage nullable

**Files:**
- Create: `database/migrations/1768500142000_make_store_fee_percentage_nullable.ts`

**Step 1: Write the migration**

```typescript
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'StoreFinancialSettings'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.float('platformFeePercentage', 8).nullable().alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.float('platformFeePercentage', 8).notNullable().defaultTo(0).alter()
    })
  }
}
```

**Step 2: Commit**

```
feat: make StoreFinancialSettings.platformFeePercentage nullable
```

---

### Task 6: Run all migrations

**Step 1: Run migrations**

Run: `node ace migration:run`
Expected: All 5 new migrations run successfully (1768500138000 through 1768500142000)

**Step 2: Commit (if any adjustments needed)**

---

### Task 7: Create WalletTopUp model

**Files:**
- Create: `app/models/wallet_top_up.ts`

**Step 1: Write the model**

```typescript
import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Student from './student.js'
import User from './user.js'

export type WalletTopUpStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED'

export default class WalletTopUp extends BaseModel {
  static table = 'WalletTopUp'

  @beforeCreate()
  static assignId(model: WalletTopUp) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare studentId: string

  @column()
  declare responsibleUserId: string

  @column()
  declare amount: number

  @column()
  declare status: WalletTopUpStatus

  @column()
  declare paymentGateway: string

  @column()
  declare paymentGatewayId: string | null

  @column()
  declare paymentMethod: string | null

  @column.dateTime()
  declare paidAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => User, { foreignKey: 'responsibleUserId' })
  declare responsible: BelongsTo<typeof User>
}
```

**Step 2: Commit**

```
feat: create WalletTopUp model
```

---

### Task 8: Create WalletTopUp DTO

**Files:**
- Create: `app/models/dto/wallet_top_up.dto.ts`

**Step 1: Write the DTO**

```typescript
import { BaseModelDto } from '@adocasts.com/dto/base'
import type WalletTopUp from '#models/wallet_top_up'
import type { WalletTopUpStatus } from '#models/wallet_top_up'
import type { DateTime } from 'luxon'

export default class WalletTopUpDto extends BaseModelDto {
  declare id: string
  declare studentId: string
  declare responsibleUserId: string
  declare amount: number
  declare status: WalletTopUpStatus
  declare paymentGateway: string
  declare paymentGatewayId: string | null
  declare paymentMethod: string | null
  declare paidAt: DateTime | null
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(model?: WalletTopUp) {
    super()

    if (!model) return

    this.id = model.id
    this.studentId = model.studentId
    this.responsibleUserId = model.responsibleUserId
    this.amount = model.amount
    this.status = model.status
    this.paymentGateway = model.paymentGateway
    this.paymentGatewayId = model.paymentGatewayId
    this.paymentMethod = model.paymentMethod
    this.paidAt = model.paidAt
    this.createdAt = model.createdAt
    this.updatedAt = model.updatedAt
  }
}
```

**Step 2: Commit**

```
feat: create WalletTopUp DTO
```

---

### Task 9: Create StoreInstallmentRule model

**Files:**
- Create: `app/models/store_installment_rule.ts`

**Step 1: Write the model**

```typescript
import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Store from './store.js'

export default class StoreInstallmentRule extends BaseModel {
  static table = 'StoreInstallmentRule'

  @beforeCreate()
  static assignId(model: StoreInstallmentRule) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare storeId: string

  @column()
  declare minAmount: number

  @column()
  declare maxInstallments: number

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => Store, { foreignKey: 'storeId' })
  declare store: BelongsTo<typeof Store>
}
```

**Step 2: Commit**

```
feat: create StoreInstallmentRule model
```

---

### Task 10: Create StoreInstallmentRule DTO

**Files:**
- Create: `app/models/dto/store_installment_rule.dto.ts`

**Step 1: Write the DTO**

```typescript
import { BaseModelDto } from '@adocasts.com/dto/base'
import type StoreInstallmentRule from '#models/store_installment_rule'
import type { DateTime } from 'luxon'

export default class StoreInstallmentRuleDto extends BaseModelDto {
  declare id: string
  declare storeId: string
  declare minAmount: number
  declare maxInstallments: number
  declare isActive: boolean
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(model?: StoreInstallmentRule) {
    super()

    if (!model) return

    this.id = model.id
    this.storeId = model.storeId
    this.minAmount = model.minAmount
    this.maxInstallments = model.maxInstallments
    this.isActive = model.isActive
    this.createdAt = model.createdAt
    this.updatedAt = model.updatedAt
  }
}
```

**Step 2: Commit**

```
feat: create StoreInstallmentRule DTO
```

---

### Task 11: Update PlatformSettings model

**Files:**
- Modify: `app/models/platform_settings.ts`

**Step 1: Add new column**

After the `defaultPricePerStudent` column declaration, add:

```typescript
  @column()
  declare defaultStorePlatformFeePercentage: number
```

**Step 2: Commit**

```
feat: add defaultStorePlatformFeePercentage to PlatformSettings model
```

---

### Task 12: Update PlatformSettings DTO

**Files:**
- Modify: `app/models/dto/platform_settings.dto.ts`

**Step 1: Add new field**

Add to the class declarations (after `defaultPricePerStudent`):

```typescript
  declare defaultStorePlatformFeePercentage: number
```

Add to the constructor (after `this.defaultPricePerStudent = ...`):

```typescript
    this.defaultStorePlatformFeePercentage = model.defaultStorePlatformFeePercentage
```

**Step 2: Commit**

```
feat: add defaultStorePlatformFeePercentage to PlatformSettings DTO
```

---

### Task 13: Update PlatformSettings validator

**Files:**
- Modify: `app/validators/subscription.ts`

**Step 1: Add field to updatePlatformSettingsValidator**

Add inside the vine.object of `updatePlatformSettingsValidator`:

```typescript
    defaultStorePlatformFeePercentage: vine.number().min(0).max(100).optional(),
```

**Step 2: Commit**

```
feat: add defaultStorePlatformFeePercentage to platform settings validator
```

---

### Task 14: Update StoreFinancialSettings model (nullable fee)

**Files:**
- Modify: `app/models/store_financial_settings.ts`

**Step 1: Change type**

Change:
```typescript
  @column()
  declare platformFeePercentage: number
```

To:
```typescript
  @column()
  declare platformFeePercentage: number | null
```

**Step 2: Commit**

```
feat: make StoreFinancialSettings.platformFeePercentage nullable
```

---

### Task 15: Update StoreFinancialSettings DTO (nullable fee)

**Files:**
- Modify: `app/models/dto/store_financial_settings.dto.ts`

**Step 1: Change type**

Change:
```typescript
  declare platformFeePercentage: number
```

To:
```typescript
  declare platformFeePercentage: number | null
```

**Step 2: Commit**

```
feat: make StoreFinancialSettings DTO platformFeePercentage nullable
```

---

### Task 16: Update Store financial settings validator (nullable fee)

**Files:**
- Modify: `app/validators/store.ts`

**Step 1: Make platformFeePercentage optional**

In `upsertStoreFinancialSettingsValidator`, change:

```typescript
    platformFeePercentage: vine.number().min(0).max(100),
```

To:

```typescript
    platformFeePercentage: vine.number().min(0).max(100).optional(),
```

**Step 2: Commit**

```
feat: make platformFeePercentage optional in store financial settings validator
```

---

### Task 17: Add installmentRules relationship to Store model

**Files:**
- Modify: `app/models/store.ts`

**Step 1: Add import**

Add import at the top:
```typescript
import StoreInstallmentRule from './store_installment_rule.js'
```

**Step 2: Add relationship**

After the `settlements` relationship, add:

```typescript
  @hasMany(() => StoreInstallmentRule, { foreignKey: 'storeId' })
  declare installmentRules: HasMany<typeof StoreInstallmentRule>
```

**Step 3: Commit**

```
feat: add installmentRules relationship to Store model
```

---

### Task 18: Create StoreInstallmentRule validators

**Files:**
- Modify: `app/validators/store.ts`

**Step 1: Add validators at the end of the file**

```typescript
// ==========================================
// Store Installment Rule Validators
// ==========================================
export const createStoreInstallmentRuleValidator = vine.compile(
  vine.object({
    storeId: vine.string().trim(),
    minAmount: vine.number().min(0),
    maxInstallments: vine.number().min(2).max(24),
    isActive: vine.boolean().optional(),
  })
)

export const updateStoreInstallmentRuleValidator = vine.compile(
  vine.object({
    minAmount: vine.number().min(0).optional(),
    maxInstallments: vine.number().min(2).max(24).optional(),
    isActive: vine.boolean().optional(),
  })
)

export const listStoreInstallmentRulesValidator = vine.compile(
  vine.object({
    storeId: vine.string().trim(),
  })
)
```

**Step 2: Commit**

```
feat: add StoreInstallmentRule validators
```

---

### Task 19: Create StoreInstallmentRule CRUD controllers

**Files:**
- Create: `app/controllers/store_installment_rules/list_store_installment_rules_controller.ts`
- Create: `app/controllers/store_installment_rules/create_store_installment_rule_controller.ts`
- Create: `app/controllers/store_installment_rules/update_store_installment_rule_controller.ts`
- Create: `app/controllers/store_installment_rules/delete_store_installment_rule_controller.ts`

**Step 1: Write ListStoreInstallmentRulesController**

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import StoreInstallmentRule from '#models/store_installment_rule'
import { listStoreInstallmentRulesValidator } from '#validators/store'

export default class ListStoreInstallmentRulesController {
  async handle({ request, response }: HttpContext) {
    const data = await request.validateUsing(listStoreInstallmentRulesValidator)

    const rules = await StoreInstallmentRule.query()
      .where('storeId', data.storeId)
      .orderBy('minAmount', 'asc')

    return response.ok(rules)
  }
}
```

**Step 2: Write CreateStoreInstallmentRuleController**

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import Store from '#models/store'
import StoreInstallmentRule from '#models/store_installment_rule'
import { createStoreInstallmentRuleValidator } from '#validators/store'

export default class CreateStoreInstallmentRuleController {
  async handle({ request, response }: HttpContext) {
    const data = await request.validateUsing(createStoreInstallmentRuleValidator)

    await Store.query().where('id', data.storeId).whereNull('deletedAt').firstOrFail()

    const rule = await StoreInstallmentRule.create({
      ...data,
      isActive: data.isActive ?? true,
    })

    return response.created(rule)
  }
}
```

**Step 3: Write UpdateStoreInstallmentRuleController**

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import StoreInstallmentRule from '#models/store_installment_rule'
import { updateStoreInstallmentRuleValidator } from '#validators/store'

export default class UpdateStoreInstallmentRuleController {
  async handle({ params, request, response }: HttpContext) {
    const rule = await StoreInstallmentRule.findOrFail(params.id)
    const data = await request.validateUsing(updateStoreInstallmentRuleValidator)

    rule.merge(data)
    await rule.save()

    return response.ok(rule)
  }
}
```

**Step 4: Write DeleteStoreInstallmentRuleController**

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import StoreInstallmentRule from '#models/store_installment_rule'

export default class DeleteStoreInstallmentRuleController {
  async handle({ params, response }: HttpContext) {
    const rule = await StoreInstallmentRule.findOrFail(params.id)
    await rule.delete()

    return response.noContent()
  }
}
```

**Step 5: Commit**

```
feat: create StoreInstallmentRule CRUD controllers
```

---

### Task 20: Register StoreInstallmentRule routes

**Files:**
- Modify: `start/routes.ts`

**Step 1: Add controller imports**

Near the other store controller imports (around line 574), add:

```typescript
const ListStoreInstallmentRulesController = () =>
  import('#controllers/store_installment_rules/list_store_installment_rules_controller')
const CreateStoreInstallmentRuleController = () =>
  import('#controllers/store_installment_rules/create_store_installment_rule_controller')
const UpdateStoreInstallmentRuleController = () =>
  import('#controllers/store_installment_rules/update_store_installment_rule_controller')
const DeleteStoreInstallmentRuleController = () =>
  import('#controllers/store_installment_rules/delete_store_installment_rule_controller')
```

**Step 2: Add route registration function**

After `registerStoreOrderApiRoutes()` function (around line 1690), add:

```typescript
function registerStoreInstallmentRuleApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListStoreInstallmentRulesController]).as('storeInstallmentRules.index')
      router.post('/', [CreateStoreInstallmentRuleController]).as('storeInstallmentRules.store')
      router
        .put('/:id', [UpdateStoreInstallmentRuleController])
        .as('storeInstallmentRules.update')
      router
        .delete('/:id', [DeleteStoreInstallmentRuleController])
        .as('storeInstallmentRules.destroy')
    })
    .prefix('/store-installment-rules')
    .use(middleware.auth())
}
```

**Step 3: Call the function**

After `registerStoreOrderApiRoutes()` call (around line 2827), add:

```typescript
    registerStoreInstallmentRuleApiRoutes()
```

**Step 4: Commit**

```
feat: register StoreInstallmentRule API routes
```

---

### Task 21: Add Lojas nav item to EscolaLayout

**Files:**
- Modify: `inertia/components/layouts/escola-layout.tsx`

**Step 1: Add Store icon import**

In the lucide-react import, add `Store` icon (or use `ShoppingBag`):

```typescript
import { ..., ShoppingBag } from 'lucide-react'
```

**Step 2: Add nav item to navigation array**

After the `Financeiro` nav item (with `DollarSign` icon) and before `Gamificacao`, add:

```typescript
  {
    title: 'Lojas',
    route: 'web.escola.lojas.index' as any,
    href: '/escola/lojas',
    icon: ShoppingBag,
  },
```

Note: The route name will be registered in a later task. Using `as any` temporarily until the page route is registered.

**Step 3: Commit**

```
feat: add Lojas nav item to escola layout sidebar
```

---

### Task 22: Create store list page controller (Inertia)

**Files:**
- Create: `app/controllers/pages/escola/show_lojas_page_controller.ts`

**Step 1: Write the controller**

```typescript
import type { HttpContext } from '@adonisjs/core/http'

export default class ShowLojasPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/lojas/index')
  }
}
```

**Step 2: Commit**

```
feat: create show lojas page controller
```

---

### Task 23: Create store detail page controller (Inertia)

**Files:**
- Create: `app/controllers/pages/escola/show_loja_detail_page_controller.ts`

**Step 1: Write the controller**

```typescript
import type { HttpContext } from '@adonisjs/core/http'

export default class ShowLojaDetailPageController {
  async handle({ inertia, params }: HttpContext) {
    return inertia.render('escola/lojas/show', { storeId: params.id })
  }
}
```

**Step 2: Commit**

```
feat: create show loja detail page controller
```

---

### Task 24: Register page routes for lojas

**Files:**
- Modify: `start/routes.ts`

**Step 1: Add page controller imports**

Near the other page controller imports, add:

```typescript
const ShowLojasPageController = () =>
  import('#controllers/pages/escola/show_lojas_page_controller')
const ShowLojaDetailPageController = () =>
  import('#controllers/pages/escola/show_loja_detail_page_controller')
```

**Step 2: Add page routes**

Inside the `registerPageRoutes()` function, find where other `/escola/*` page routes are registered and add:

```typescript
      router.get('/escola/lojas', [ShowLojasPageController]).as('web.escola.lojas.index')
      router.get('/escola/lojas/:id', [ShowLojaDetailPageController]).as('web.escola.lojas.show')
```

**Step 3: Commit**

```
feat: register escola lojas page routes
```

---

### Task 25: Create store list frontend page

**Files:**
- Create: `inertia/pages/escola/lojas/index.tsx`

**Step 1: Write the page**

This page lists all stores for the school with ability to create new ones. It fetches data from the API using the existing store routes.

```tsx
import { Head } from '@inertiajs/react'
import { EscolaLayout } from '../../../components/layouts'
import { StoreListContainer } from '../../../containers/store-list-container'

export default function LojasPage() {
  return (
    <EscolaLayout>
      <Head title="Lojas" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lojas</h1>
          <p className="text-muted-foreground">
            Gerencie as lojas da instituição
          </p>
        </div>
        <StoreListContainer />
      </div>
    </EscolaLayout>
  )
}
```

**Step 2: Commit**

```
feat: create lojas list page
```

---

### Task 26: Create store list container

**Files:**
- Create: `inertia/containers/store-list-container.tsx`

**Step 1: Write the container**

This container fetches stores from the API, shows them in a table/grid, and has a button to create new stores. Uses the existing `/api/v1/stores` endpoint.

```tsx
import { useEffect, useState } from 'react'
import { Link } from '@inertiajs/react'
import { Plus, Store as StoreIcon, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import { Badge } from '../components/ui/badge'
import { CreateStoreModal } from './stores/create-store-modal'
import { useStores } from '../hooks/queries/use_stores'

export function StoreListContainer() {
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const { data: stores, isLoading, refetch } = useStores()

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Todas as Lojas</CardTitle>
            <CardDescription>
              Lojas internas e terceirizadas da instituição
            </CardDescription>
          </div>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Loja
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : !stores?.data?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma loja cadastrada
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Dono</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.data.map((store: any) => (
                  <TableRow key={store.id}>
                    <TableCell>
                      <Link
                        href={`/escola/lojas/${store.id}`}
                        className="font-medium hover:underline"
                      >
                        {store.name}
                      </Link>
                      {store.description && (
                        <p className="text-sm text-muted-foreground truncate max-w-xs">
                          {store.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={store.type === 'INTERNAL' ? 'default' : 'secondary'}>
                        {store.type === 'INTERNAL' ? 'Interna' : 'Terceirizada'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {store.owner?.name ?? (store.type === 'INTERNAL' ? 'Escola' : '—')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={store.isActive ? 'default' : 'outline'}>
                        {store.isActive ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/escola/lojas/${store.id}`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Ver detalhes
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CreateStoreModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={() => {
          setCreateModalOpen(false)
          refetch()
        }}
      />
    </>
  )
}
```

**Step 2: Commit**

```
feat: create store list container
```

---

### Task 27: Create useStores query hook

**Files:**
- Create: `inertia/hooks/queries/use_stores.ts`

**Step 1: Write the hook**

Check other hooks in `inertia/hooks/queries/` to follow the exact fetching pattern (whether they use react-query, SWR, or plain fetch). Follow the same pattern. The hook should fetch from the stores API endpoint.

```typescript
import { useQuery } from '@tanstack/react-query'
import { api } from '../../../.adonisjs/api'

async function fetchStores(params?: { schoolId?: string; type?: string; isActive?: boolean }) {
  const searchParams = new URLSearchParams()
  if (params?.schoolId) searchParams.set('schoolId', params.schoolId)
  if (params?.type) searchParams.set('type', params.type)
  if (params?.isActive !== undefined) searchParams.set('isActive', String(params.isActive))

  const response = await fetch(`/api/v1/stores?${searchParams.toString()}`, {
    credentials: 'include',
  })

  if (!response.ok) throw new Error('Failed to fetch stores')
  return response.json()
}

export function useStores(params?: { schoolId?: string; type?: string; isActive?: boolean }) {
  return useQuery({
    queryKey: ['stores', params],
    queryFn: () => fetchStores(params),
  })
}
```

Note: Check `inertia/hooks/queries/` for the actual fetching pattern. If they use Tuyau client (`api`) instead of raw fetch, adapt accordingly. The hook above uses the most common pattern but should be adjusted to match the project's convention.

**Step 2: Commit**

```
feat: create useStores query hook
```

---

### Task 28: Create store mutations hook

**Files:**
- Create: `inertia/hooks/mutations/use_store_mutations.ts`

**Step 1: Write the hook**

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'

async function createStore(data: {
  schoolId: string
  name: string
  type: 'INTERNAL' | 'THIRD_PARTY'
  description?: string
  ownerUserId?: string
  commissionPercentage?: number
}) {
  const response = await fetch('/api/v1/stores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to create store')
  }
  return response.json()
}

async function updateStore(id: string, data: Record<string, unknown>) {
  const response = await fetch(`/api/v1/stores/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to update store')
  }
  return response.json()
}

async function deleteStore(id: string) {
  const response = await fetch(`/api/v1/stores/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to delete store')
  }
}

export function useCreateStore() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createStore,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stores'] }),
  })
}

export function useUpdateStore() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      updateStore(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stores'] }),
  })
}

export function useDeleteStore() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteStore,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stores'] }),
  })
}
```

Note: Same caveat -- check existing hooks in `inertia/hooks/mutations/` and adapt the fetch pattern to match (raw fetch vs Tuyau client).

**Step 2: Commit**

```
feat: create store mutation hooks
```

---

### Task 29: Create CreateStoreModal

**Files:**
- Create: `inertia/containers/stores/create-store-modal.tsx`

**Step 1: Write the modal**

A dialog that lets the admin create a new store. Fields: name, description, type (INTERNAL/THIRD_PARTY), commission percentage (shown only for THIRD_PARTY). Owner selection deferred to Phase 2 (Store Owner).

```tsx
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { useCreateStore } from '../../hooks/mutations/use_store_mutations'
import { usePage } from '@inertiajs/react'
import type { SharedProps } from '../../lib/types'

interface CreateStoreModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateStoreModal({ open, onOpenChange, onSuccess }: CreateStoreModalProps) {
  const { props } = usePage<SharedProps>()
  const createStore = useCreateStore()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'INTERNAL' | 'THIRD_PARTY'>('INTERNAL')
  const [commissionPercentage, setCommissionPercentage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const schoolId = props.selectedSchoolIds?.[0]
    if (!schoolId) return

    await createStore.mutateAsync({
      schoolId,
      name,
      type,
      description: description || undefined,
      commissionPercentage: type === 'THIRD_PARTY' && commissionPercentage
        ? Number(commissionPercentage)
        : undefined,
    })

    setName('')
    setDescription('')
    setType('INTERNAL')
    setCommissionPercentage('')
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nova Loja</DialogTitle>
            <DialogDescription>
              Crie uma nova loja para a instituição
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome da loja"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição da loja (opcional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={type} onValueChange={(v) => setType(v as 'INTERNAL' | 'THIRD_PARTY')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INTERNAL">Interna (da escola)</SelectItem>
                  <SelectItem value="THIRD_PARTY">Terceirizada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {type === 'THIRD_PARTY' && (
              <div className="space-y-2">
                <Label htmlFor="commission">Comissão (%)</Label>
                <Input
                  id="commission"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={commissionPercentage}
                  onChange={(e) => setCommissionPercentage(e.target.value)}
                  placeholder="Ex: 10"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createStore.isPending || !name}>
              {createStore.isPending ? 'Criando...' : 'Criar Loja'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

**Step 2: Commit**

```
feat: create CreateStoreModal component
```

---

### Task 30: Create store detail page

**Files:**
- Create: `inertia/pages/escola/lojas/show.tsx`

**Step 1: Write the page**

A tabbed page with tabs: Produtos, Pedidos, Regras de Parcelamento, Configurações, Settlements.

```tsx
import { Head } from '@inertiajs/react'
import { EscolaLayout } from '../../../components/layouts'
import { StoreDetailContainer } from '../../../containers/store-detail-container'

interface Props {
  storeId: string
}

export default function LojaDetailPage({ storeId }: Props) {
  return (
    <EscolaLayout>
      <Head title="Detalhe da Loja" />
      <StoreDetailContainer storeId={storeId} />
    </EscolaLayout>
  )
}
```

**Step 2: Commit**

```
feat: create loja detail page
```

---

### Task 31: Create store detail container

**Files:**
- Create: `inertia/containers/store-detail-container.tsx`

**Step 1: Write the container**

Uses tabs to organize store detail sections. Fetches store data by ID.

```tsx
import { useEffect, useState } from 'react'
import { Link } from '@inertiajs/react'
import { ArrowLeft, Pencil } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { useQuery } from '@tanstack/react-query'
import { StoreProductsTab } from './stores/store-products-tab'
import { StoreOrdersTab } from './stores/store-orders-tab'
import { StoreInstallmentRulesTab } from './stores/store-installment-rules-tab'
import { StoreFinancialSettingsTab } from './stores/store-financial-settings-tab'
import { StoreSettlementsTab } from './stores/store-settlements-tab'

interface StoreDetailContainerProps {
  storeId: string
}

async function fetchStore(id: string) {
  const response = await fetch(`/api/v1/stores/${id}`, { credentials: 'include' })
  if (!response.ok) throw new Error('Failed to fetch store')
  return response.json()
}

export function StoreDetailContainer({ storeId }: StoreDetailContainerProps) {
  const { data: store, isLoading } = useQuery({
    queryKey: ['store', storeId],
    queryFn: () => fetchStore(storeId),
  })

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Carregando...</div>
  }

  if (!store) {
    return <div className="text-center py-8 text-muted-foreground">Loja não encontrada</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/escola/lojas">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{store.name}</h1>
              <Badge variant={store.type === 'INTERNAL' ? 'default' : 'secondary'}>
                {store.type === 'INTERNAL' ? 'Interna' : 'Terceirizada'}
              </Badge>
              <Badge variant={store.isActive ? 'default' : 'outline'}>
                {store.isActive ? 'Ativa' : 'Inativa'}
              </Badge>
            </div>
            {store.description && (
              <p className="text-muted-foreground">{store.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
          <TabsTrigger value="installment-rules">Parcelamento</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
          {store.type === 'THIRD_PARTY' && (
            <TabsTrigger value="settlements">Repasses</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="products">
          <StoreProductsTab storeId={storeId} />
        </TabsContent>

        <TabsContent value="orders">
          <StoreOrdersTab storeId={storeId} />
        </TabsContent>

        <TabsContent value="installment-rules">
          <StoreInstallmentRulesTab storeId={storeId} />
        </TabsContent>

        <TabsContent value="financial">
          <StoreFinancialSettingsTab storeId={storeId} />
        </TabsContent>

        {store.type === 'THIRD_PARTY' && (
          <TabsContent value="settlements">
            <StoreSettlementsTab storeId={storeId} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
```

**Step 2: Commit**

```
feat: create store detail container with tabs
```

---

### Task 32: Create StoreProductsTab

**Files:**
- Create: `inertia/containers/stores/store-products-tab.tsx`

**Step 1: Write the tab**

Lists store items filtered by storeId, with ability to toggle active status. Uses the existing `/api/v1/store-items` endpoint.

```tsx
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { Badge } from '../../components/ui/badge'
import { Switch } from '../../components/ui/switch'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatCurrency } from '../../lib/utils'

interface StoreProductsTabProps {
  storeId: string
}

async function fetchStoreItems(storeId: string) {
  const response = await fetch(`/api/v1/store-items?storeId=${storeId}`, {
    credentials: 'include',
  })
  if (!response.ok) throw new Error('Failed to fetch items')
  return response.json()
}

async function toggleItemActive(id: string) {
  const response = await fetch(`/api/v1/store-items/${id}/toggle-active`, {
    method: 'PATCH',
    credentials: 'include',
  })
  if (!response.ok) throw new Error('Failed to toggle item')
  return response.json()
}

export function StoreProductsTab({ storeId }: StoreProductsTabProps) {
  const queryClient = useQueryClient()
  const { data: items, isLoading } = useQuery({
    queryKey: ['storeItems', storeId],
    queryFn: () => fetchStoreItems(storeId),
  })

  const toggleMutation = useMutation({
    mutationFn: toggleItemActive,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storeItems', storeId] }),
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Produtos</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : !items?.data?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum produto cadastrado
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preco</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Ativo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.data.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.category}</Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(item.price)}</TableCell>
                  <TableCell>{item.totalStock ?? '∞'}</TableCell>
                  <TableCell>
                    <Switch
                      checked={item.isActive}
                      onCheckedChange={() => toggleMutation.mutate(item.id)}
                      disabled={toggleMutation.isPending}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
```

**Step 2: Commit**

```
feat: create StoreProductsTab component
```

---

### Task 33: Create StoreOrdersTab

**Files:**
- Create: `inertia/containers/stores/store-orders-tab.tsx`

**Step 1: Write the tab**

Lists orders for the store. Uses the existing `/api/v1/store-orders` endpoint filtered by storeId.

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { Badge } from '../../components/ui/badge'
import { useQuery } from '@tanstack/react-query'
import { formatCurrency } from '../../lib/utils'

interface StoreOrdersTabProps {
  storeId: string
}

async function fetchStoreOrders(storeId: string) {
  const response = await fetch(`/api/v1/store-orders?storeId=${storeId}`, {
    credentials: 'include',
  })
  if (!response.ok) throw new Error('Failed to fetch orders')
  return response.json()
}

const statusLabels: Record<string, string> = {
  PENDING_PAYMENT: 'Aguardando Pgto',
  PENDING_APPROVAL: 'Aguardando Aprovacao',
  APPROVED: 'Aprovado',
  PREPARING: 'Preparando',
  READY: 'Pronto',
  DELIVERED: 'Entregue',
  CANCELED: 'Cancelado',
  REJECTED: 'Rejeitado',
}

const statusVariants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  PENDING_PAYMENT: 'outline',
  PENDING_APPROVAL: 'secondary',
  APPROVED: 'default',
  PREPARING: 'secondary',
  READY: 'default',
  DELIVERED: 'default',
  CANCELED: 'destructive',
  REJECTED: 'destructive',
}

export function StoreOrdersTab({ storeId }: StoreOrdersTabProps) {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['storeOrders', storeId],
    queryFn: () => fetchStoreOrders(storeId),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pedidos</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : !orders?.data?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum pedido encontrado
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Aluno</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.data.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">
                    {order.orderNumber}
                  </TableCell>
                  <TableCell>{order.student?.user?.name ?? '—'}</TableCell>
                  <TableCell>{formatCurrency(order.totalMoney)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {order.paymentMode === 'IMMEDIATE' ? 'Imediato' : 'Na Fatura'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariants[order.status] ?? 'outline'}>
                      {statusLabels[order.status] ?? order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
```

**Step 2: Commit**

```
feat: create StoreOrdersTab component
```

---

### Task 34: Create StoreInstallmentRulesTab

**Files:**
- Create: `inertia/containers/stores/store-installment-rules-tab.tsx`

**Step 1: Write the tab**

CRUD for installment rules. Uses the new `/api/v1/store-installment-rules` endpoint.

```tsx
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { Switch } from '../../components/ui/switch'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatCurrency } from '../../lib/utils'

interface StoreInstallmentRulesTabProps {
  storeId: string
}

async function fetchRules(storeId: string) {
  const response = await fetch(`/api/v1/store-installment-rules?storeId=${storeId}`, {
    credentials: 'include',
  })
  if (!response.ok) throw new Error('Failed to fetch rules')
  return response.json()
}

async function createRule(data: { storeId: string; minAmount: number; maxInstallments: number }) {
  const response = await fetch('/api/v1/store-installment-rules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to create rule')
  return response.json()
}

async function deleteRule(id: string) {
  const response = await fetch(`/api/v1/store-installment-rules/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!response.ok) throw new Error('Failed to delete rule')
}

export function StoreInstallmentRulesTab({ storeId }: StoreInstallmentRulesTabProps) {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [minAmount, setMinAmount] = useState('')
  const [maxInstallments, setMaxInstallments] = useState('')

  const { data: rules, isLoading } = useQuery({
    queryKey: ['storeInstallmentRules', storeId],
    queryFn: () => fetchRules(storeId),
  })

  const createMutation = useMutation({
    mutationFn: createRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeInstallmentRules', storeId] })
      setCreateOpen(false)
      setMinAmount('')
      setMaxInstallments('')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteRule,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storeInstallmentRules', storeId] }),
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      storeId,
      minAmount: Math.round(Number(minAmount) * 100),
      maxInstallments: Number(maxInstallments),
    })
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Regras de Parcelamento</CardTitle>
            <CardDescription>
              Defina faixas de valor e o numero maximo de parcelas para cada faixa
            </CardDescription>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Regra
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : !rules?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma regra cadastrada. Sem regras, parcelamento nao fica disponivel.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Valor minimo</TableHead>
                  <TableHead>Parcelas maximas</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule: any) => (
                  <TableRow key={rule.id}>
                    <TableCell>{formatCurrency(rule.minAmount)}</TableCell>
                    <TableCell>{rule.maxInstallments}x</TableCell>
                    <TableCell>
                      <Switch checked={rule.isActive} disabled />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(rule.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>Nova Regra de Parcelamento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="minAmount">Valor minimo (R$)</Label>
                <Input
                  id="minAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  placeholder="Ex: 50.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxInstallments">Parcelas maximas</Label>
                <Input
                  id="maxInstallments"
                  type="number"
                  min="2"
                  max="24"
                  value={maxInstallments}
                  onChange={(e) => setMaxInstallments(e.target.value)}
                  placeholder="Ex: 3"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Criando...' : 'Criar Regra'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
```

**Step 2: Commit**

```
feat: create StoreInstallmentRulesTab component
```

---

### Task 35: Create StoreFinancialSettingsTab

**Files:**
- Create: `inertia/containers/stores/store-financial-settings-tab.tsx`

**Step 1: Write the tab**

Shows and edits financial settings for the store. Uses the existing `/api/v1/stores/:storeId/financial-settings` endpoints.

```tsx
import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface StoreFinancialSettingsTabProps {
  storeId: string
}

async function fetchSettings(storeId: string) {
  const response = await fetch(`/api/v1/stores/${storeId}/financial-settings`, {
    credentials: 'include',
  })
  if (response.status === 404) return null
  if (!response.ok) throw new Error('Failed to fetch settings')
  return response.json()
}

async function upsertSettings(storeId: string, data: Record<string, unknown>) {
  const response = await fetch(`/api/v1/stores/${storeId}/financial-settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to save settings')
  return response.json()
}

export function StoreFinancialSettingsTab({ storeId }: StoreFinancialSettingsTabProps) {
  const queryClient = useQueryClient()
  const { data: settings, isLoading } = useQuery({
    queryKey: ['storeFinancialSettings', storeId],
    queryFn: () => fetchSettings(storeId),
  })

  const [fee, setFee] = useState('')
  const [pixKey, setPixKey] = useState('')
  const [pixKeyType, setPixKeyType] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountHolder, setAccountHolder] = useState('')

  useEffect(() => {
    if (settings) {
      setFee(settings.platformFeePercentage?.toString() ?? '')
      setPixKey(settings.pixKey ?? '')
      setPixKeyType(settings.pixKeyType ?? '')
      setBankName(settings.bankName ?? '')
      setAccountHolder(settings.accountHolder ?? '')
    }
  }, [settings])

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => upsertSettings(storeId, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['storeFinancialSettings', storeId] }),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({
      platformFeePercentage: fee ? Number(fee) : undefined,
      pixKey: pixKey || undefined,
      pixKeyType: pixKeyType || undefined,
      bankName: bankName || undefined,
      accountHolder: accountHolder || undefined,
    })
  }

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Carregando...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuracoes Financeiras</CardTitle>
        <CardDescription>
          Taxa da plataforma e dados bancarios para repasse.
          Se a taxa ficar vazia, usa o padrao da plataforma.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="fee">Taxa da plataforma (%) — vazio = padrao</Label>
            <Input
              id="fee"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              placeholder="Padrao da plataforma"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pixKey">Chave PIX</Label>
            <Input
              id="pixKey"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              placeholder="Chave PIX"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pixKeyType">Tipo da Chave</Label>
            <Select value={pixKeyType} onValueChange={setPixKeyType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CPF">CPF</SelectItem>
                <SelectItem value="CNPJ">CNPJ</SelectItem>
                <SelectItem value="EMAIL">E-mail</SelectItem>
                <SelectItem value="PHONE">Telefone</SelectItem>
                <SelectItem value="RANDOM">Aleatoria</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankName">Banco</Label>
            <Input
              id="bankName"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Nome do banco"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountHolder">Titular</Label>
            <Input
              id="accountHolder"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              placeholder="Nome do titular"
            />
          </div>

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Salvando...' : 'Salvar'}
          </Button>

          {mutation.isSuccess && (
            <p className="text-sm text-green-600">Salvo com sucesso</p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
```

**Step 2: Commit**

```
feat: create StoreFinancialSettingsTab component
```

---

### Task 36: Create StoreSettlementsTab

**Files:**
- Create: `inertia/containers/stores/store-settlements-tab.tsx`

**Step 1: Write the tab**

Lists settlements for the store. Uses existing `/api/v1/store-settlements` endpoint.

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { Badge } from '../../components/ui/badge'
import { useQuery } from '@tanstack/react-query'
import { formatCurrency } from '../../lib/utils'

interface StoreSettlementsTabProps {
  storeId: string
}

async function fetchSettlements(storeId: string) {
  const response = await fetch(`/api/v1/store-settlements?storeId=${storeId}`, {
    credentials: 'include',
  })
  if (!response.ok) throw new Error('Failed to fetch settlements')
  return response.json()
}

const statusLabels: Record<string, string> = {
  PENDING: 'Pendente',
  APPROVED: 'Aprovado',
  PROCESSING: 'Processando',
  TRANSFERRED: 'Transferido',
  FAILED: 'Falhou',
  CANCELLED: 'Cancelado',
}

export function StoreSettlementsTab({ storeId }: StoreSettlementsTabProps) {
  const { data: settlements, isLoading } = useQuery({
    queryKey: ['storeSettlements', storeId],
    queryFn: () => fetchSettlements(storeId),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Repasses</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : !settlements?.data?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum repasse encontrado
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Periodo</TableHead>
                <TableHead>Vendas</TableHead>
                <TableHead>Comissao</TableHead>
                <TableHead>Taxa</TableHead>
                <TableHead>Repasse</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settlements.data.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell>{String(s.month).padStart(2, '0')}/{s.year}</TableCell>
                  <TableCell>{formatCurrency(s.totalSalesAmount)}</TableCell>
                  <TableCell>{formatCurrency(s.commissionAmount)}</TableCell>
                  <TableCell>{formatCurrency(s.platformFeeAmount)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(s.transferAmount)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {statusLabels[s.status] ?? s.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
```

**Step 2: Commit**

```
feat: create StoreSettlementsTab component
```

---

### Task 37: Verify everything compiles and runs

**Step 1: Run build**

Run: `npm run build` (or the project's build command)
Expected: No TypeScript errors

**Step 2: Run dev server**

Run: `npm run dev`
Expected: Server starts, navigate to `/escola/lojas`, page loads

**Step 3: Smoke test**

1. Navigate to `/escola/lojas` -- should show empty store list
2. Click "Nova Loja" -- modal should open
3. Create an INTERNAL store -- should appear in the list
4. Click on the store -- should navigate to detail page with tabs
5. Check each tab renders without errors

**Step 4: Final commit if adjustments needed**

```
fix: phase 1 adjustments from smoke test
```

---
