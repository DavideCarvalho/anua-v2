# Store Phase 2: Store Owner Panel — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Give third-party store owners a self-service panel to manage their own store: products, orders, and financial settings.

**Architecture:** New `storeOwner` middleware resolves the authenticated user's store and attaches it to `HttpContext`. Dedicated `/api/v1/store-owner/*` API routes are scoped to that store. A new `LojaLayout` sidebar drives the `/loja/*` web pages.

**Tech Stack:** AdonisJS 6 + Lucid ORM, PostgreSQL, VineJS, React (Inertia.js), shadcn/ui, @tanstack/react-query, Tuyau client

---

## Context for all tasks

**Existing code you'll need:**
- Store model: `app/models/store.ts` — has `ownerUserId`, `items`, `orders`, `financialSettings`, `settlements`, `installmentRules` relationships
- StoreItem model: `app/models/store_item.ts` — soft-delete pattern (`deletedAt`)
- StoreOrder model: `app/models/store_order.ts` — status machine with timestamp columns
- StoreFinancialSettings model: `app/models/store_financial_settings.ts` — `updateOrCreate` pattern
- StoreSettlement model: `app/models/store_settlement.ts` — month/year based
- Impersonation middleware: `app/middleware/impersonation_middleware.ts` — pattern for extending HttpContext via `declare module`
- RequireRole middleware: `app/middleware/require_role_middleware.ts` — `handle(ctx, next, roles: string[])`
- Admin layout: `inertia/components/layouts/admin-layout.tsx` — sidebar pattern to copy for LojaLayout
- Existing store validators: `app/validators/store.ts` — has `upsertStoreFinancialSettingsValidator`, `listStoreSettlementsValidator`
- Existing item/order validators: `app/validators/gamification.ts` — has `listStoreItemsValidator`, `listStoreOrdersValidator`, `createStoreItemValidator`, `updateStoreItemValidator`
- Existing admin order action controllers: `app/controllers/store_orders/approve_store_order_controller.ts`, `reject_...`, `deliver_...`, `cancel_...` — pattern for status transitions
- Routes file: `start/routes.ts` — add new `registerStoreOwnerApiRoutes()` function and web route group
- Kernel: `start/kernel.ts` — register `storeOwner` named middleware
- Frontend types: `inertia/lib/types.ts` — `RoleName` union type, helper functions

**Naming conventions:**
- Controllers: `snake_case` file names in folders, one class per file
- Models: PascalCase class, `snake_case` file
- Validators: exported const with camelCase
- Frontend hooks: `use_snake_case.ts` files, camelCase exports
- Frontend containers: `kebab-case.tsx` files, PascalCase exports
- Routes: dot-notation naming `api.v1.storeOwner.products.index`

---

## Task 1: Add STORE_OWNER role type and create storeOwner middleware

**Files:**
- Modify: `inertia/lib/types.ts`
- Create: `app/middleware/store_owner_middleware.ts`
- Modify: `start/kernel.ts`

### Step 1: Add STORE_OWNER to RoleName type

In `inertia/lib/types.ts`:

Add `'STORE_OWNER'` to the `RoleName` union (after `'SCHOOL_CANTEEN'`):

```typescript
export type RoleName =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'SCHOOL_DIRECTOR'
  | 'SCHOOL_COORDINATOR'
  | 'SCHOOL_ADMIN'
  | 'SCHOOL_ADMINISTRATIVE'
  | 'SCHOOL_TEACHER'
  | 'SCHOOL_CANTEEN'
  | 'STORE_OWNER'
  | 'TEACHER'
  | 'STUDENT'
  | 'RESPONSIBLE'
  | 'STUDENT_RESPONSIBLE'
```

Add helper function after `isStudent`:

```typescript
export function isStoreOwner(user: UserDto | null): boolean {
  return hasRole(user, ['STORE_OWNER'])
}
```

### Step 2: Create storeOwner middleware

Create `app/middleware/store_owner_middleware.ts`:

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import Store from '#models/store'

/**
 * Store Owner Middleware
 *
 * Verifies that the authenticated user owns at least one active store.
 * Loads the first active store and attaches it to `ctx.storeOwnerStore`.
 *
 * Must come AFTER auth middleware.
 */
export default class StoreOwnerMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const { auth, request, response } = ctx
    const user = auth.user

    if (!user) {
      return response.unauthorized({ message: 'Não autenticado' })
    }

    const store = await Store.query()
      .where('ownerUserId', user.id)
      .whereNull('deletedAt')
      .where('isActive', true)
      .preload('school')
      .first()

    if (!store) {
      if (request.accepts(['html', 'json']) === 'html') {
        return response.redirect('/dashboard')
      }
      return response.forbidden({ message: 'Você não possui uma loja ativa' })
    }

    ctx.storeOwnerStore = store

    return next()
  }
}

declare module '@adonisjs/core/http' {
  interface HttpContext {
    storeOwnerStore?: Store
  }
}
```

### Step 3: Register middleware in kernel

In `start/kernel.ts`, add `storeOwner` to the named middleware object:

```typescript
export const middleware = router.named({
  guest: () => import('#middleware/guest_middleware'),
  auth: () => import('#middleware/auth_middleware'),
  requireSchool: () => import('#middleware/require_school_middleware'),
  requireRole: () => import('#middleware/require_role_middleware'),
  impersonation: () => import('#middleware/impersonation_middleware'),
  storeOwner: () => import('#middleware/store_owner_middleware'),
})
```

### Step 4: Commit

```
feat: add STORE_OWNER role type and storeOwner middleware
```

---

## Task 2: Create store owner API controllers — store and products

**Files:**
- Create: `app/controllers/store_owner/show_own_store_controller.ts`
- Create: `app/controllers/store_owner/list_own_products_controller.ts`
- Create: `app/controllers/store_owner/create_product_controller.ts`
- Create: `app/controllers/store_owner/update_product_controller.ts`
- Create: `app/controllers/store_owner/delete_product_controller.ts`
- Create: `app/controllers/store_owner/toggle_product_active_controller.ts`

All controllers access `ctx.storeOwnerStore!` (set by middleware) to scope queries.

### show_own_store_controller.ts

```typescript
import type { HttpContext } from '@adonisjs/core/http'

export default class ShowOwnStoreController {
  async handle({ storeOwnerStore, response }: HttpContext) {
    const store = storeOwnerStore!
    await store.load('financialSettings')
    await store.load('owner')
    return response.ok(store)
  }
}
```

### list_own_products_controller.ts

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import StoreItem from '#models/store_item'
import { listStoreItemsValidator } from '#validators/gamification'

export default class ListOwnProductsController {
  async handle({ storeOwnerStore, request, response }: HttpContext) {
    const store = storeOwnerStore!
    const data = await request.validateUsing(listStoreItemsValidator)
    const page = data.page ?? 1
    const limit = data.limit ?? 20

    const query = StoreItem.query()
      .where('storeId', store.id)
      .whereNull('deletedAt')
      .orderBy('name', 'asc')

    if (data.category) query.where('category', data.category)
    if (data.paymentMode) query.where('paymentMode', data.paymentMode)
    if (data.isActive !== undefined) query.where('isActive', data.isActive)

    const items = await query.paginate(page, limit)
    return response.ok(items)
  }
}
```

### create_product_controller.ts

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import StoreItem from '#models/store_item'
import { createStoreItemValidator } from '#validators/gamification'

export default class CreateProductController {
  async handle({ storeOwnerStore, request, response }: HttpContext) {
    const store = storeOwnerStore!
    const data = await request.validateUsing(createStoreItemValidator)

    if (data.paymentMode === 'HYBRID') {
      const min = data.minPointsPercentage ?? 0
      const max = data.maxPointsPercentage ?? 100
      if (min > max) {
        return response.badRequest({
          message: 'minPointsPercentage deve ser menor ou igual a maxPointsPercentage',
        })
      }
    }

    const item = await StoreItem.create({
      ...data,
      schoolId: store.schoolId,
      storeId: store.id,
      isActive: data.isActive ?? true,
    })

    return response.created(item)
  }
}
```

### update_product_controller.ts

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import StoreItem from '#models/store_item'
import { updateStoreItemValidator } from '#validators/gamification'

export default class UpdateProductController {
  async handle({ storeOwnerStore, params, request, response }: HttpContext) {
    const store = storeOwnerStore!
    const item = await StoreItem.query()
      .where('id', params.id)
      .where('storeId', store.id)
      .whereNull('deletedAt')
      .first()

    if (!item) {
      return response.notFound({ message: 'Produto não encontrado' })
    }

    const data = await request.validateUsing(updateStoreItemValidator)

    const effectivePaymentMode = data.paymentMode ?? item.paymentMode
    if (effectivePaymentMode === 'HYBRID') {
      const min = data.minPointsPercentage ?? item.minPointsPercentage ?? 0
      const max = data.maxPointsPercentage ?? item.maxPointsPercentage ?? 100
      if (min > max) {
        return response.badRequest({
          message: 'minPointsPercentage deve ser menor ou igual a maxPointsPercentage',
        })
      }
    }

    item.merge(data)
    await item.save()

    return response.ok(item)
  }
}
```

### delete_product_controller.ts

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StoreItem from '#models/store_item'

export default class DeleteProductController {
  async handle({ storeOwnerStore, params, response }: HttpContext) {
    const store = storeOwnerStore!
    const item = await StoreItem.query()
      .where('id', params.id)
      .where('storeId', store.id)
      .whereNull('deletedAt')
      .first()

    if (!item) {
      return response.notFound({ message: 'Produto não encontrado' })
    }

    item.deletedAt = DateTime.now()
    await item.save()

    return response.noContent()
  }
}
```

### toggle_product_active_controller.ts

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import StoreItem from '#models/store_item'

export default class ToggleProductActiveController {
  async handle({ storeOwnerStore, params, response }: HttpContext) {
    const store = storeOwnerStore!
    const item = await StoreItem.query()
      .where('id', params.id)
      .where('storeId', store.id)
      .whereNull('deletedAt')
      .first()

    if (!item) {
      return response.notFound({ message: 'Produto não encontrado' })
    }

    item.isActive = !item.isActive
    await item.save()

    return response.ok(item)
  }
}
```

### Commit

```
feat: add store owner API controllers for store and products
```

---

## Task 3: Create store owner API controllers — orders

**Files:**
- Create: `app/controllers/store_owner/list_own_orders_controller.ts`
- Create: `app/controllers/store_owner/show_order_controller.ts`
- Create: `app/controllers/store_owner/approve_order_controller.ts`
- Create: `app/controllers/store_owner/reject_order_controller.ts`
- Create: `app/controllers/store_owner/mark_preparing_controller.ts`
- Create: `app/controllers/store_owner/mark_ready_controller.ts`
- Create: `app/controllers/store_owner/deliver_order_controller.ts`

All order controllers scope queries by `storeId = store.id`.

### list_own_orders_controller.ts

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import StoreOrder from '#models/store_order'
import { listStoreOrdersValidator } from '#validators/gamification'

export default class ListOwnOrdersController {
  async handle({ storeOwnerStore, request, response }: HttpContext) {
    const store = storeOwnerStore!
    const data = await request.validateUsing(listStoreOrdersValidator)
    const page = data.page ?? 1
    const limit = data.limit ?? 10

    const query = StoreOrder.query()
      .where('storeId', store.id)
      .preload('student')
      .preload('items', (q) => q.preload('storeItem'))
      .orderBy('createdAt', 'desc')

    if (data.status) query.where('status', data.status)
    if (data.search) {
      query.whereHas('student', (sq) => {
        sq.whereILike('name', `%${data.search}%`)
      })
    }

    const orders = await query.paginate(page, limit)
    return response.ok(orders)
  }
}
```

### show_order_controller.ts

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import StoreOrder from '#models/store_order'

export default class ShowOrderController {
  async handle({ storeOwnerStore, params, response }: HttpContext) {
    const store = storeOwnerStore!
    const order = await StoreOrder.query()
      .where('id', params.id)
      .where('storeId', store.id)
      .preload('student')
      .preload('items', (q) => q.preload('storeItem'))
      .first()

    if (!order) {
      return response.notFound({ message: 'Pedido não encontrado' })
    }

    return response.ok(order)
  }
}
```

### approve_order_controller.ts

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StoreOrder from '#models/store_order'

export default class ApproveOrderController {
  async handle({ storeOwnerStore, params, auth, response }: HttpContext) {
    const store = storeOwnerStore!
    const order = await StoreOrder.query()
      .where('id', params.id)
      .where('storeId', store.id)
      .first()

    if (!order) {
      return response.notFound({ message: 'Pedido não encontrado' })
    }

    if (order.status !== 'PENDING_APPROVAL') {
      return response.badRequest({
        message: `Não é possível aprovar pedido com status: ${order.status}`,
      })
    }

    order.status = 'APPROVED'
    order.approvedAt = DateTime.now()
    order.approvedBy = auth.user!.id
    await order.save()

    await order.load('student')
    await order.load('items', (q) => q.preload('storeItem'))

    return response.ok(order)
  }
}
```

### reject_order_controller.ts

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StoreOrder from '#models/store_order'

export default class RejectOrderController {
  async handle({ storeOwnerStore, params, request, auth, response }: HttpContext) {
    const store = storeOwnerStore!
    const order = await StoreOrder.query()
      .where('id', params.id)
      .where('storeId', store.id)
      .first()

    if (!order) {
      return response.notFound({ message: 'Pedido não encontrado' })
    }

    if (order.status !== 'PENDING_APPROVAL') {
      return response.badRequest({
        message: `Não é possível rejeitar pedido com status: ${order.status}`,
      })
    }

    const { reason } = request.only(['reason'])

    order.status = 'REJECTED'
    order.canceledAt = DateTime.now()
    order.cancellationReason = reason ?? null
    await order.save()

    await order.load('student')
    await order.load('items', (q) => q.preload('storeItem'))

    return response.ok(order)
  }
}
```

### mark_preparing_controller.ts

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StoreOrder from '#models/store_order'

export default class MarkPreparingController {
  async handle({ storeOwnerStore, params, auth, response }: HttpContext) {
    const store = storeOwnerStore!
    const order = await StoreOrder.query()
      .where('id', params.id)
      .where('storeId', store.id)
      .first()

    if (!order) {
      return response.notFound({ message: 'Pedido não encontrado' })
    }

    if (order.status !== 'APPROVED') {
      return response.badRequest({
        message: `Não é possível preparar pedido com status: ${order.status}`,
      })
    }

    order.status = 'PREPARING'
    order.preparingAt = DateTime.now()
    order.preparedBy = auth.user!.id
    await order.save()

    await order.load('student')
    await order.load('items', (q) => q.preload('storeItem'))

    return response.ok(order)
  }
}
```

### mark_ready_controller.ts

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StoreOrder from '#models/store_order'

export default class MarkReadyController {
  async handle({ storeOwnerStore, params, response }: HttpContext) {
    const store = storeOwnerStore!
    const order = await StoreOrder.query()
      .where('id', params.id)
      .where('storeId', store.id)
      .first()

    if (!order) {
      return response.notFound({ message: 'Pedido não encontrado' })
    }

    if (order.status !== 'PREPARING') {
      return response.badRequest({
        message: `Não é possível marcar como pronto pedido com status: ${order.status}`,
      })
    }

    order.status = 'READY'
    order.readyAt = DateTime.now()
    await order.save()

    await order.load('student')
    await order.load('items', (q) => q.preload('storeItem'))

    return response.ok(order)
  }
}
```

### deliver_order_controller.ts

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StoreOrder from '#models/store_order'

export default class DeliverOrderController {
  async handle({ storeOwnerStore, params, auth, response }: HttpContext) {
    const store = storeOwnerStore!
    const order = await StoreOrder.query()
      .where('id', params.id)
      .where('storeId', store.id)
      .first()

    if (!order) {
      return response.notFound({ message: 'Pedido não encontrado' })
    }

    const allowedStatuses = ['APPROVED', 'PREPARING', 'READY']
    if (!allowedStatuses.includes(order.status)) {
      return response.badRequest({
        message: `Não é possível entregar pedido com status: ${order.status}`,
      })
    }

    order.status = 'DELIVERED'
    order.deliveredAt = DateTime.now()
    order.deliveredBy = auth.user!.id
    await order.save()

    await order.load('student')
    await order.load('items', (q) => q.preload('storeItem'))

    return response.ok(order)
  }
}
```

### Commit

```
feat: add store owner order management controllers
```

---

## Task 4: Create store owner API controllers — financial

**Files:**
- Create: `app/controllers/store_owner/show_financial_settings_controller.ts`
- Create: `app/controllers/store_owner/update_financial_settings_controller.ts`
- Create: `app/controllers/store_owner/list_settlements_controller.ts`

### show_financial_settings_controller.ts

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import StoreFinancialSettings from '#models/store_financial_settings'

export default class ShowFinancialSettingsController {
  async handle({ storeOwnerStore, response }: HttpContext) {
    const store = storeOwnerStore!
    const settings = await StoreFinancialSettings.query()
      .where('storeId', store.id)
      .first()

    return response.ok(settings)
  }
}
```

### update_financial_settings_controller.ts

Store owner can only update their own PIX/bank details, NOT the platform fee percentage.

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import StoreFinancialSettings from '#models/store_financial_settings'

const updateOwnFinancialSettingsValidator = vine.compile(
  vine.object({
    pixKey: vine.string().trim().optional(),
    pixKeyType: vine.enum(['CPF', 'CNPJ', 'EMAIL', 'PHONE', 'RANDOM']).optional(),
    bankName: vine.string().trim().maxLength(255).optional(),
    accountHolder: vine.string().trim().maxLength(255).optional(),
  })
)

export default class UpdateFinancialSettingsController {
  async handle({ storeOwnerStore, request, response }: HttpContext) {
    const store = storeOwnerStore!
    const data = await request.validateUsing(updateOwnFinancialSettingsValidator)

    const settings = await StoreFinancialSettings.updateOrCreate(
      { storeId: store.id },
      data
    )

    return response.ok(settings)
  }
}
```

### list_settlements_controller.ts

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import StoreSettlement from '#models/store_settlement'

export default class ListSettlementsController {
  async handle({ storeOwnerStore, request, response }: HttpContext) {
    const store = storeOwnerStore!
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const status = request.input('status')

    const query = StoreSettlement.query()
      .where('storeId', store.id)
      .orderBy('year', 'desc')
      .orderBy('month', 'desc')

    if (status) query.where('status', status)

    const settlements = await query.paginate(page, limit)
    return response.ok(settlements)
  }
}
```

### Commit

```
feat: add store owner financial settings and settlements controllers
```

---

## Task 5: Register store owner routes (API + web) and page controllers

**Files:**
- Create: `app/controllers/pages/loja/show_loja_dashboard_page_controller.ts`
- Create: `app/controllers/pages/loja/show_loja_produtos_page_controller.ts`
- Create: `app/controllers/pages/loja/show_loja_pedidos_page_controller.ts`
- Create: `app/controllers/pages/loja/show_loja_financeiro_page_controller.ts`
- Modify: `start/routes.ts`

### Page controllers

All page controllers follow the same simple pattern — render an Inertia page.

**show_loja_dashboard_page_controller.ts:**
```typescript
import type { HttpContext } from '@adonisjs/core/http'

export default class ShowLojaDashboardPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('loja/index')
  }
}
```

**show_loja_produtos_page_controller.ts:**
```typescript
import type { HttpContext } from '@adonisjs/core/http'

export default class ShowLojaProdutosPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('loja/produtos')
  }
}
```

**show_loja_pedidos_page_controller.ts:**
```typescript
import type { HttpContext } from '@adonisjs/core/http'

export default class ShowLojaPedidosPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('loja/pedidos')
  }
}
```

**show_loja_financeiro_page_controller.ts:**
```typescript
import type { HttpContext } from '@adonisjs/core/http'

export default class ShowLojaFinanceiroPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('loja/financeiro')
  }
}
```

### Routes — API

Add a `registerStoreOwnerApiRoutes()` function in `start/routes.ts`. Place it near the existing store route functions (around line 1700).

**Controller imports** (add near the other store controller imports, around line 575):

```typescript
// Store Owner Controllers
const ShowOwnStoreController = () =>
  import('#controllers/store_owner/show_own_store_controller')
const ListOwnProductsController = () =>
  import('#controllers/store_owner/list_own_products_controller')
const SOCreateProductController = () =>
  import('#controllers/store_owner/create_product_controller')
const SOUpdateProductController = () =>
  import('#controllers/store_owner/update_product_controller')
const SODeleteProductController = () =>
  import('#controllers/store_owner/delete_product_controller')
const SOToggleProductActiveController = () =>
  import('#controllers/store_owner/toggle_product_active_controller')
const ListOwnOrdersController = () =>
  import('#controllers/store_owner/list_own_orders_controller')
const SOShowOrderController = () =>
  import('#controllers/store_owner/show_order_controller')
const SOApproveOrderController = () =>
  import('#controllers/store_owner/approve_order_controller')
const SORejectOrderController = () =>
  import('#controllers/store_owner/reject_order_controller')
const SOMarkPreparingController = () =>
  import('#controllers/store_owner/mark_preparing_controller')
const SOMarkReadyController = () =>
  import('#controllers/store_owner/mark_ready_controller')
const SODeliverOrderController = () =>
  import('#controllers/store_owner/deliver_order_controller')
const SOShowFinancialSettingsController = () =>
  import('#controllers/store_owner/show_financial_settings_controller')
const SOUpdateFinancialSettingsController = () =>
  import('#controllers/store_owner/update_financial_settings_controller')
const SOListSettlementsController = () =>
  import('#controllers/store_owner/list_settlements_controller')
```

**Route function:**

```typescript
function registerStoreOwnerApiRoutes() {
  router
    .group(() => {
      // Store info
      router.get('/store', [ShowOwnStoreController]).as('storeOwner.store.show')

      // Products
      router.get('/products', [ListOwnProductsController]).as('storeOwner.products.index')
      router.post('/products', [SOCreateProductController]).as('storeOwner.products.store')
      router.put('/products/:id', [SOUpdateProductController]).as('storeOwner.products.update')
      router.delete('/products/:id', [SODeleteProductController]).as('storeOwner.products.destroy')
      router
        .patch('/products/:id/toggle-active', [SOToggleProductActiveController])
        .as('storeOwner.products.toggleActive')

      // Orders
      router.get('/orders', [ListOwnOrdersController]).as('storeOwner.orders.index')
      router.get('/orders/:id', [SOShowOrderController]).as('storeOwner.orders.show')
      router.post('/orders/:id/approve', [SOApproveOrderController]).as('storeOwner.orders.approve')
      router.post('/orders/:id/reject', [SORejectOrderController]).as('storeOwner.orders.reject')
      router
        .post('/orders/:id/preparing', [SOMarkPreparingController])
        .as('storeOwner.orders.preparing')
      router.post('/orders/:id/ready', [SOMarkReadyController]).as('storeOwner.orders.ready')
      router.post('/orders/:id/deliver', [SODeliverOrderController]).as('storeOwner.orders.deliver')

      // Financial
      router
        .get('/financial-settings', [SOShowFinancialSettingsController])
        .as('storeOwner.financial.show')
      router
        .put('/financial-settings', [SOUpdateFinancialSettingsController])
        .as('storeOwner.financial.update')
      router.get('/settlements', [SOListSettlementsController]).as('storeOwner.settlements.index')
    })
    .prefix('/store-owner')
    .use([middleware.auth(), middleware.storeOwner()])
}
```

**Register the function** in the `router.group` at the bottom of the file (around line 2862, after `registerStoreInstallmentRuleApiRoutes()`):

```typescript
registerStoreOwnerApiRoutes()
```

### Routes — Web pages

**Page controller imports** (add near other page controller imports, around line 2294):

```typescript
// Loja (Store Owner) page controllers
const ShowLojaDashboardPageController = () =>
  import('#controllers/pages/loja/show_loja_dashboard_page_controller')
const ShowLojaProdutosPageController = () =>
  import('#controllers/pages/loja/show_loja_produtos_page_controller')
const ShowLojaPedidosPageController = () =>
  import('#controllers/pages/loja/show_loja_pedidos_page_controller')
const ShowLojaFinanceiroPageController = () =>
  import('#controllers/pages/loja/show_loja_financeiro_page_controller')
```

**Web route group** — add inside `registerPageRoutes()`, after the admin group (around line 2797, before the closing `}).as('web')`):

```typescript
// Store owner pages
router
  .group(() => {
    router.get('/', [ShowLojaDashboardPageController]).as('dashboard')
    router.get('/produtos', [ShowLojaProdutosPageController]).as('produtos')
    router.get('/pedidos', [ShowLojaPedidosPageController]).as('pedidos')
    router.get('/financeiro', [ShowLojaFinanceiroPageController]).as('financeiro')
  })
  .prefix('/loja')
  .use([middleware.auth(), middleware.storeOwner()])
  .as('loja')
```

### Commit

```
feat: register store owner API and web routes with page controllers
```

---

## Task 6: Create LojaLayout and frontend hooks

**Files:**
- Create: `inertia/components/layouts/loja-layout.tsx`
- Create: `inertia/hooks/queries/use_store_owner.ts`
- Create: `inertia/hooks/mutations/use_store_owner_mutations.ts`

### LojaLayout

Follow the `admin-layout.tsx` pattern exactly — sidebar with `SidebarProvider`, header with `SidebarTrigger` + `ThemeToggle`, main content area.

Navigation items:
- Dashboard (`/loja`, icon: `LayoutDashboard`)
- Produtos (`/loja/produtos`, icon: `Package`)
- Pedidos (`/loja/pedidos`, icon: `ShoppingCart`)
- Financeiro (`/loja/financeiro`, icon: `Wallet`)

```tsx
import { usePage } from '@inertiajs/react'
import { Link } from '@tuyau/inertia/react'
import type { PropsWithChildren } from 'react'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Wallet,
  LogOut,
  Store,
} from 'lucide-react'

import { ThemeToggle } from '../theme-toggle'
import type { SharedProps } from '../../lib/types'
import { formatRoleName } from '../../lib/formatters'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '../ui/sidebar'
import { api } from '../../../.adonisjs/api'
import type { RouteName } from '@tuyau/client'

interface NavItem {
  title: string
  route: RouteName<typeof api.routes>
  href: string
  icon: React.ElementType
}

const navigation: NavItem[] = [
  { title: 'Dashboard', route: 'web.loja.dashboard', href: '/loja', icon: LayoutDashboard },
  { title: 'Produtos', route: 'web.loja.produtos', href: '/loja/produtos', icon: Package },
  { title: 'Pedidos', route: 'web.loja.pedidos', href: '/loja/pedidos', icon: ShoppingCart },
  { title: 'Financeiro', route: 'web.loja.financeiro', href: '/loja/financeiro', icon: Wallet },
]

function AppSidebar() {
  const { props, url } = usePage<SharedProps>()
  const user = props.user
  const pathname = url.split('?')[0]

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link route="web.loja.dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Store className="h-4 w-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Minha Loja</span>
                  <span className="text-xs text-muted-foreground">Painel do lojista</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link route={item.route as any} params={undefined as any}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {user?.name?.charAt(0).toUpperCase() || 'L'}
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-medium truncate">{user?.name}</span>
                <span className="text-xs text-muted-foreground truncate">
                  {formatRoleName(user?.role?.name)}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <Link
          route="api.v1.auth.logout"
          className="inline-flex w-full items-center justify-start gap-2 whitespace-nowrap rounded-md border border-input bg-background px-3 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <LogOut className="h-4 w-4" />
          <span>Sair</span>
        </Link>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

export function LojaLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1" />
          <ThemeToggle />
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
```

### Query hook — use_store_owner.ts

```typescript
import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

// Own store
const $storeRoute = tuyau.api.v1['store-owner'].store.$get

export type OwnStoreResponse = InferResponseType<typeof $storeRoute>

export function useOwnStoreQueryOptions() {
  return {
    queryKey: ['storeOwner', 'store'],
    queryFn: () => $storeRoute().unwrap(),
  } satisfies QueryOptions
}

// Own products
const $productsRoute = tuyau.api.v1['store-owner'].products.$get

export type OwnProductsResponse = InferResponseType<typeof $productsRoute>

type ProductsQuery = NonNullable<Parameters<typeof $productsRoute>[0]>['query']

export function useOwnProductsQueryOptions(query: ProductsQuery = {}) {
  const mergedQuery: ProductsQuery = {
    page: 1,
    limit: 20,
    ...query,
  }
  return {
    queryKey: ['storeOwner', 'products', mergedQuery],
    queryFn: () => $productsRoute({ query: mergedQuery }).unwrap(),
  } satisfies QueryOptions
}

// Own orders
const $ordersRoute = tuyau.api.v1['store-owner'].orders.$get

export type OwnOrdersResponse = InferResponseType<typeof $ordersRoute>

type OrdersQuery = NonNullable<Parameters<typeof $ordersRoute>[0]>['query']

export function useOwnOrdersQueryOptions(query: OrdersQuery = {}) {
  const mergedQuery: OrdersQuery = {
    page: 1,
    limit: 10,
    ...query,
  }
  return {
    queryKey: ['storeOwner', 'orders', mergedQuery],
    queryFn: () => $ordersRoute({ query: mergedQuery }).unwrap(),
  } satisfies QueryOptions
}

// Financial settings
const $financialRoute = tuyau.api.v1['store-owner']['financial-settings'].$get

export type OwnFinancialResponse = InferResponseType<typeof $financialRoute>

export function useOwnFinancialQueryOptions() {
  return {
    queryKey: ['storeOwner', 'financial'],
    queryFn: () => $financialRoute().unwrap(),
  } satisfies QueryOptions
}

// Settlements
const $settlementsRoute = tuyau.api.v1['store-owner'].settlements.$get

export type OwnSettlementsResponse = InferResponseType<typeof $settlementsRoute>

type SettlementsQuery = NonNullable<Parameters<typeof $settlementsRoute>[0]>['query']

export function useOwnSettlementsQueryOptions(query: SettlementsQuery = {}) {
  const mergedQuery: SettlementsQuery = {
    page: 1,
    limit: 20,
    ...query,
  }
  return {
    queryKey: ['storeOwner', 'settlements', mergedQuery],
    queryFn: () => $settlementsRoute({ query: mergedQuery }).unwrap(),
  } satisfies QueryOptions
}
```

### Mutation hook — use_store_owner_mutations.ts

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

// Product mutations
const $createProduct = tuyau.$route('api.v1.storeOwner.products.store')
type CreateProductPayload = InferRequestType<typeof $createProduct.$post>

const $updateProduct = tuyau.$route('api.v1.storeOwner.products.update')
type UpdateProductPayload = InferRequestType<typeof $updateProduct.$put> & { id: string }

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateProductPayload) =>
      tuyau.$route('api.v1.storeOwner.products.store').$post(data).unwrap(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['storeOwner', 'products'] })
    },
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateProductPayload) =>
      tuyau.$route('api.v1.storeOwner.products.update', { id }).$put(data).unwrap(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['storeOwner', 'products'] })
    },
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      tuyau.$route('api.v1.storeOwner.products.destroy', { id }).$delete().unwrap(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['storeOwner', 'products'] })
    },
  })
}

export function useToggleProductActive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      tuyau.$route('api.v1.storeOwner.products.toggleActive', { id }).$patch().unwrap(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['storeOwner', 'products'] })
    },
  })
}

// Order action mutations
export function useApproveOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      tuyau.$route('api.v1.storeOwner.orders.approve', { id }).$post().unwrap(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['storeOwner', 'orders'] })
    },
  })
}

export function useRejectOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      tuyau.$route('api.v1.storeOwner.orders.reject', { id }).$post({ reason }).unwrap(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['storeOwner', 'orders'] })
    },
  })
}

export function useMarkPreparing() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      tuyau.$route('api.v1.storeOwner.orders.preparing', { id }).$post().unwrap(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['storeOwner', 'orders'] })
    },
  })
}

export function useMarkReady() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      tuyau.$route('api.v1.storeOwner.orders.ready', { id }).$post().unwrap(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['storeOwner', 'orders'] })
    },
  })
}

export function useDeliverOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      tuyau.$route('api.v1.storeOwner.orders.deliver', { id }).$post().unwrap(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['storeOwner', 'orders'] })
    },
  })
}

// Financial settings mutation
const $updateFinancial = tuyau.$route('api.v1.storeOwner.financial.update')
type UpdateFinancialPayload = InferRequestType<typeof $updateFinancial.$put>

export function useUpdateFinancialSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateFinancialPayload) =>
      tuyau.$route('api.v1.storeOwner.financial.update').$put(data).unwrap(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['storeOwner', 'financial'] })
    },
  })
}
```

### Commit

```
feat: add LojaLayout and store owner query/mutation hooks
```

---

## Task 7: Create store owner dashboard page

**Files:**
- Create: `inertia/pages/loja/index.tsx`
- Create: `inertia/containers/store-owner-dashboard-container.tsx`

### Dashboard page — `inertia/pages/loja/index.tsx`

```tsx
import { Head } from '@inertiajs/react'
import { LojaLayout } from '../../components/layouts/loja-layout'
import { StoreOwnerDashboardContainer } from '../../containers/store-owner-dashboard-container'

export default function LojaDashboardPage() {
  return (
    <LojaLayout>
      <Head title="Dashboard da Loja" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral da sua loja</p>
        </div>
        <StoreOwnerDashboardContainer />
      </div>
    </LojaLayout>
  )
}
```

### Dashboard container — `inertia/containers/store-owner-dashboard-container.tsx`

Shows store info card + quick metrics (total products, pending orders, recent settlements).

```tsx
import { useQuery } from '@tanstack/react-query'
import { Package, ShoppingCart, DollarSign, Store } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import {
  useOwnStoreQueryOptions,
  useOwnProductsQueryOptions,
  useOwnOrdersQueryOptions,
} from '../hooks/queries/use_store_owner'

export function StoreOwnerDashboardContainer() {
  const { data: storeData, isLoading: storeLoading } = useQuery(useOwnStoreQueryOptions())
  const { data: productsData } = useQuery(useOwnProductsQueryOptions({ limit: 1 }))
  const { data: pendingOrdersData } = useQuery(
    useOwnOrdersQueryOptions({ status: 'PENDING_APPROVAL', limit: 1 })
  )
  const { data: allOrdersData } = useQuery(useOwnOrdersQueryOptions({ limit: 1 }))

  if (storeLoading) {
    return <div className="text-center py-8 text-muted-foreground">Carregando...</div>
  }

  const store = storeData as any

  return (
    <div className="space-y-6">
      {/* Store info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>{store?.name}</CardTitle>
              <CardDescription>{store?.description || 'Sem descrição'}</CardDescription>
            </div>
            <Badge variant={store?.isActive ? 'default' : 'outline'} className="ml-auto">
              {store?.isActive ? 'Ativa' : 'Inativa'}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(productsData as any)?.meta?.total ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">produtos cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(pendingOrdersData as any)?.meta?.total ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">aguardando aprovação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(allOrdersData as any)?.meta?.total ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">pedidos realizados</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

### Commit

```
feat: add store owner dashboard page with metrics
```

---

## Task 8: Create store owner products page

**Files:**
- Create: `inertia/pages/loja/produtos.tsx`
- Create: `inertia/containers/store-owner-products-container.tsx`
- Create: `inertia/containers/store-owner/create-product-modal.tsx`
- Create: `inertia/containers/store-owner/edit-product-modal.tsx`

### Products page — `inertia/pages/loja/produtos.tsx`

```tsx
import { Head } from '@inertiajs/react'
import { LojaLayout } from '../../components/layouts/loja-layout'
import { StoreOwnerProductsContainer } from '../../containers/store-owner-products-container'

export default function LojaProdutosPage() {
  return (
    <LojaLayout>
      <Head title="Produtos" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground">Gerencie os produtos da sua loja</p>
        </div>
        <StoreOwnerProductsContainer />
      </div>
    </LojaLayout>
  )
}
```

### Products container — `inertia/containers/store-owner-products-container.tsx`

Table of products with create/edit modals, active toggle, and delete.

```tsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
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
import { Switch } from '../components/ui/switch'
import { useOwnProductsQueryOptions } from '../hooks/queries/use_store_owner'
import { useToggleProductActive, useDeleteProduct } from '../hooks/mutations/use_store_owner_mutations'
import { CreateProductModal } from './store-owner/create-product-modal'
import { EditProductModal } from './store-owner/edit-product-modal'
import { formatCurrency } from '../lib/utils'

const CATEGORY_LABELS: Record<string, string> = {
  CANTEEN_FOOD: 'Alimento',
  CANTEEN_DRINK: 'Bebida',
  SCHOOL_SUPPLY: 'Material',
  PRIVILEGE: 'Privilégio',
  HOMEWORK_PASS: 'Passe Tarefa',
  UNIFORM: 'Uniforme',
  BOOK: 'Livro',
  MERCHANDISE: 'Mercadoria',
  DIGITAL: 'Digital',
  OTHER: 'Outro',
}

export function StoreOwnerProductsContainer() {
  const [createOpen, setCreateOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)

  const { data, isLoading } = useQuery(useOwnProductsQueryOptions())
  const toggleActive = useToggleProductActive()
  const deleteProduct = useDeleteProduct()

  const products = (data as any)?.data ?? []

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Produtos</CardTitle>
            <CardDescription>Todos os produtos da sua loja</CardDescription>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : !products.length ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum produto cadastrado
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product: any) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="font-medium">{product.name}</div>
                      {product.description && (
                        <p className="text-sm text-muted-foreground truncate max-w-xs">
                          {product.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {CATEGORY_LABELS[product.category] ?? product.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {product.paymentMode === 'POINTS_ONLY'
                        ? `${product.price} pts`
                        : formatCurrency(product.price)}
                    </TableCell>
                    <TableCell>
                      {product.totalStock !== null ? product.totalStock : '∞'}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={product.isActive}
                        onCheckedChange={() => toggleActive.mutate(product.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingProduct(product)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              if (confirm('Tem certeza que deseja excluir este produto?')) {
                                deleteProduct.mutate(product.id)
                              }
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
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

      <CreateProductModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={() => setCreateOpen(false)}
      />

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          open={!!editingProduct}
          onOpenChange={(open) => !open && setEditingProduct(null)}
          onSuccess={() => setEditingProduct(null)}
        />
      )}
    </>
  )
}
```

### Create product modal — `inertia/containers/store-owner/create-product-modal.tsx`

```tsx
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { useCreateProduct } from '../../hooks/mutations/use_store_owner_mutations'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const CATEGORIES = [
  { value: 'CANTEEN_FOOD', label: 'Alimento' },
  { value: 'CANTEEN_DRINK', label: 'Bebida' },
  { value: 'SCHOOL_SUPPLY', label: 'Material Escolar' },
  { value: 'UNIFORM', label: 'Uniforme' },
  { value: 'BOOK', label: 'Livro' },
  { value: 'MERCHANDISE', label: 'Mercadoria' },
  { value: 'DIGITAL', label: 'Digital' },
  { value: 'OTHER', label: 'Outro' },
]

export function CreateProductModal({ open, onOpenChange, onSuccess }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('OTHER')
  const [totalStock, setTotalStock] = useState('')

  const createProduct = useCreateProduct()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    createProduct.mutate(
      {
        name,
        description: description || undefined,
        price: Number(price),
        category: category as any,
        paymentMode: 'MONEY_ONLY',
        totalStock: totalStock ? Number(totalStock) : undefined,
      } as any,
      {
        onSuccess: () => {
          setName('')
          setDescription('')
          setPrice('')
          setCategory('OTHER')
          setTotalStock('')
          onSuccess()
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Produto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço (centavos)</Label>
              <Input
                id="price"
                type="number"
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="totalStock">Estoque (deixe vazio para ilimitado)</Label>
            <Input
              id="totalStock"
              type="number"
              min="0"
              value={totalStock}
              onChange={(e) => setTotalStock(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createProduct.isPending}>
              {createProduct.isPending ? 'Salvando...' : 'Criar Produto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

### Edit product modal — `inertia/containers/store-owner/edit-product-modal.tsx`

```tsx
import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { useUpdateProduct } from '../../hooks/mutations/use_store_owner_mutations'

interface Props {
  product: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const CATEGORIES = [
  { value: 'CANTEEN_FOOD', label: 'Alimento' },
  { value: 'CANTEEN_DRINK', label: 'Bebida' },
  { value: 'SCHOOL_SUPPLY', label: 'Material Escolar' },
  { value: 'UNIFORM', label: 'Uniforme' },
  { value: 'BOOK', label: 'Livro' },
  { value: 'MERCHANDISE', label: 'Mercadoria' },
  { value: 'DIGITAL', label: 'Digital' },
  { value: 'OTHER', label: 'Outro' },
]

export function EditProductModal({ product, open, onOpenChange, onSuccess }: Props) {
  const [name, setName] = useState(product.name)
  const [description, setDescription] = useState(product.description ?? '')
  const [price, setPrice] = useState(String(product.price))
  const [category, setCategory] = useState(product.category)
  const [totalStock, setTotalStock] = useState(
    product.totalStock !== null ? String(product.totalStock) : ''
  )

  const updateProduct = useUpdateProduct()

  useEffect(() => {
    setName(product.name)
    setDescription(product.description ?? '')
    setPrice(String(product.price))
    setCategory(product.category)
    setTotalStock(product.totalStock !== null ? String(product.totalStock) : '')
  }, [product])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    updateProduct.mutate(
      {
        id: product.id,
        name,
        description: description || undefined,
        price: Number(price),
        category: category as any,
        totalStock: totalStock ? Number(totalStock) : undefined,
      } as any,
      { onSuccess }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Produto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nome</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Descrição</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-price">Preço (centavos)</Label>
              <Input
                id="edit-price"
                type="number"
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-totalStock">Estoque (deixe vazio para ilimitado)</Label>
            <Input
              id="edit-totalStock"
              type="number"
              min="0"
              value={totalStock}
              onChange={(e) => setTotalStock(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateProduct.isPending}>
              {updateProduct.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

### Commit

```
feat: add store owner products page with CRUD modals
```

---

## Task 9: Create store owner orders page

**Files:**
- Create: `inertia/pages/loja/pedidos.tsx`
- Create: `inertia/containers/store-owner-orders-container.tsx`

### Orders page — `inertia/pages/loja/pedidos.tsx`

```tsx
import { Head } from '@inertiajs/react'
import { LojaLayout } from '../../components/layouts/loja-layout'
import { StoreOwnerOrdersContainer } from '../../containers/store-owner-orders-container'

export default function LojaPedidosPage() {
  return (
    <LojaLayout>
      <Head title="Pedidos" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-muted-foreground">Gerencie os pedidos da sua loja</p>
        </div>
        <StoreOwnerOrdersContainer />
      </div>
    </LojaLayout>
  )
}
```

### Orders container — `inertia/containers/store-owner-orders-container.tsx`

Table of orders with status badges and action buttons for the order lifecycle.

```tsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Check,
  X,
  ChefHat,
  PackageCheck,
  Truck,
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { useOwnOrdersQueryOptions } from '../hooks/queries/use_store_owner'
import {
  useApproveOrder,
  useRejectOrder,
  useMarkPreparing,
  useMarkReady,
  useDeliverOrder,
} from '../hooks/mutations/use_store_owner_mutations'
import { formatCurrency } from '../lib/utils'

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: 'Pagamento Pendente',
  PENDING_APPROVAL: 'Aguardando Aprovação',
  APPROVED: 'Aprovado',
  PREPARING: 'Preparando',
  READY: 'Pronto',
  DELIVERED: 'Entregue',
  CANCELED: 'Cancelado',
  REJECTED: 'Rejeitado',
}

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PENDING_PAYMENT: 'outline',
  PENDING_APPROVAL: 'secondary',
  APPROVED: 'default',
  PREPARING: 'default',
  READY: 'default',
  DELIVERED: 'default',
  CANCELED: 'destructive',
  REJECTED: 'destructive',
}

export function StoreOwnerOrdersContainer() {
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery(
    useOwnOrdersQueryOptions({
      status: (statusFilter || undefined) as any,
      search: search || undefined,
    })
  )

  const approveOrder = useApproveOrder()
  const rejectOrder = useRejectOrder()
  const markPreparing = useMarkPreparing()
  const markReady = useMarkReady()
  const deliverOrder = useDeliverOrder()

  const orders = (data as any)?.data ?? []

  function handleReject(orderId: string) {
    const reason = prompt('Motivo da rejeição (opcional):')
    rejectOrder.mutate({ id: orderId, reason: reason ?? undefined })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pedidos</CardTitle>
        <CardDescription>Todos os pedidos da sua loja</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-4">
          <Input
            placeholder="Buscar por aluno..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="PENDING_APPROVAL">Aguardando Aprovação</SelectItem>
              <SelectItem value="APPROVED">Aprovado</SelectItem>
              <SelectItem value="PREPARING">Preparando</SelectItem>
              <SelectItem value="READY">Pronto</SelectItem>
              <SelectItem value="DELIVERED">Entregue</SelectItem>
              <SelectItem value="CANCELED">Cancelado</SelectItem>
              <SelectItem value="REJECTED">Rejeitado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : !orders.length ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum pedido encontrado
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Aluno</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">
                    {order.orderNumber}
                  </TableCell>
                  <TableCell>{order.student?.name ?? '—'}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {order.items?.map((item: any) => (
                        <div key={item.id}>
                          {item.quantity}x {item.storeItem?.name ?? 'Item'}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(order.totalMoney)}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANTS[order.status] ?? 'outline'}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {order.status === 'PENDING_APPROVAL' && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => approveOrder.mutate(order.id)}
                            disabled={approveOrder.isPending}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(order.id)}
                            disabled={rejectOrder.isPending}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Rejeitar
                          </Button>
                        </>
                      )}
                      {order.status === 'APPROVED' && (
                        <Button
                          size="sm"
                          onClick={() => markPreparing.mutate(order.id)}
                          disabled={markPreparing.isPending}
                        >
                          <ChefHat className="h-3 w-3 mr-1" />
                          Preparar
                        </Button>
                      )}
                      {order.status === 'PREPARING' && (
                        <Button
                          size="sm"
                          onClick={() => markReady.mutate(order.id)}
                          disabled={markReady.isPending}
                        >
                          <PackageCheck className="h-3 w-3 mr-1" />
                          Pronto
                        </Button>
                      )}
                      {['APPROVED', 'PREPARING', 'READY'].includes(order.status) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deliverOrder.mutate(order.id)}
                          disabled={deliverOrder.isPending}
                        >
                          <Truck className="h-3 w-3 mr-1" />
                          Entregar
                        </Button>
                      )}
                    </div>
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

### Commit

```
feat: add store owner orders page with action buttons
```

---

## Task 10: Create store owner financial page

**Files:**
- Create: `inertia/pages/loja/financeiro.tsx`
- Create: `inertia/containers/store-owner-financial-container.tsx`

### Financial page — `inertia/pages/loja/financeiro.tsx`

```tsx
import { Head } from '@inertiajs/react'
import { LojaLayout } from '../../components/layouts/loja-layout'
import { StoreOwnerFinancialContainer } from '../../containers/store-owner-financial-container'

export default function LojaFinanceiroPage() {
  return (
    <LojaLayout>
      <Head title="Financeiro" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground">Configurações financeiras e repasses</p>
        </div>
        <StoreOwnerFinancialContainer />
      </div>
    </LojaLayout>
  )
}
```

### Financial container — `inertia/containers/store-owner-financial-container.tsx`

Two sections: PIX/bank settings form + settlements table.

```tsx
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import {
  useOwnFinancialQueryOptions,
  useOwnSettlementsQueryOptions,
} from '../hooks/queries/use_store_owner'
import { useUpdateFinancialSettings } from '../hooks/mutations/use_store_owner_mutations'
import { formatCurrency } from '../lib/utils'

const SETTLEMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  APPROVED: 'Aprovado',
  PROCESSING: 'Processando',
  TRANSFERRED: 'Transferido',
  FAILED: 'Falhou',
  CANCELLED: 'Cancelado',
}

const SETTLEMENT_STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PENDING: 'outline',
  APPROVED: 'secondary',
  PROCESSING: 'secondary',
  TRANSFERRED: 'default',
  FAILED: 'destructive',
  CANCELLED: 'destructive',
}

const PIX_KEY_TYPES = [
  { value: 'CPF', label: 'CPF' },
  { value: 'CNPJ', label: 'CNPJ' },
  { value: 'EMAIL', label: 'E-mail' },
  { value: 'PHONE', label: 'Telefone' },
  { value: 'RANDOM', label: 'Chave aleatória' },
]

export function StoreOwnerFinancialContainer() {
  const { data: financialData, isLoading: financialLoading } = useQuery(
    useOwnFinancialQueryOptions()
  )
  const { data: settlementsData, isLoading: settlementsLoading } = useQuery(
    useOwnSettlementsQueryOptions()
  )

  const updateSettings = useUpdateFinancialSettings()
  const settings = financialData as any

  const [pixKey, setPixKey] = useState('')
  const [pixKeyType, setPixKeyType] = useState('CPF')
  const [bankName, setBankName] = useState('')
  const [accountHolder, setAccountHolder] = useState('')

  useEffect(() => {
    if (settings) {
      setPixKey(settings.pixKey ?? '')
      setPixKeyType(settings.pixKeyType ?? 'CPF')
      setBankName(settings.bankName ?? '')
      setAccountHolder(settings.accountHolder ?? '')
    }
  }, [settings])

  function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault()
    updateSettings.mutate({
      pixKey: pixKey || undefined,
      pixKeyType: (pixKeyType || undefined) as any,
      bankName: bankName || undefined,
      accountHolder: accountHolder || undefined,
    } as any)
  }

  const settlements = (settlementsData as any)?.data ?? []

  return (
    <div className="space-y-6">
      {/* PIX/Bank Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Dados para Recebimento</CardTitle>
          <CardDescription>
            Configure sua chave PIX e dados bancários para receber os repasses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {financialLoading ? (
            <div className="text-center py-4 text-muted-foreground">Carregando...</div>
          ) : (
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pixKeyType">Tipo da Chave PIX</Label>
                  <Select value={pixKeyType} onValueChange={setPixKeyType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PIX_KEY_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pixKey">Chave PIX</Label>
                  <Input
                    id="pixKey"
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Banco</Label>
                  <Input
                    id="bankName"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountHolder">Titular da Conta</Label>
                  <Input
                    id="accountHolder"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit" disabled={updateSettings.isPending}>
                {updateSettings.isPending ? 'Salvando...' : 'Salvar Dados'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Settlements */}
      <Card>
        <CardHeader>
          <CardTitle>Repasses</CardTitle>
          <CardDescription>Histórico de repasses mensais</CardDescription>
        </CardHeader>
        <CardContent>
          {settlementsLoading ? (
            <div className="text-center py-4 text-muted-foreground">Carregando...</div>
          ) : !settlements.length ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum repasse registrado
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead>Vendas</TableHead>
                  <TableHead>Comissão</TableHead>
                  <TableHead>Taxa Plataforma</TableHead>
                  <TableHead>Repasse</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settlements.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      {String(s.month).padStart(2, '0')}/{s.year}
                    </TableCell>
                    <TableCell>{formatCurrency(s.totalSalesAmount)}</TableCell>
                    <TableCell>{formatCurrency(s.commissionAmount)}</TableCell>
                    <TableCell>{formatCurrency(s.platformFeeAmount)}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(s.transferAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={SETTLEMENT_STATUS_VARIANTS[s.status] ?? 'outline'}>
                        {SETTLEMENT_STATUS_LABELS[s.status] ?? s.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

### Commit

```
feat: add store owner financial page with settings and settlements
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | STORE_OWNER role type + storeOwner middleware | 3 (1 new, 2 modified) |
| 2 | Store/product API controllers | 6 new |
| 3 | Order API controllers | 7 new |
| 4 | Financial API controllers | 3 new |
| 5 | Routes + page controllers | 4 new + 1 modified |
| 6 | LojaLayout + hooks | 3 new |
| 7 | Dashboard page + container | 2 new |
| 8 | Products page + container + modals | 4 new |
| 9 | Orders page + container | 2 new |
| 10 | Financial page + container | 2 new |
| **Total** | | **36 new files, 3 modified** |

**Dependencies:**
- Task 1 must complete first (middleware types needed by all controllers)
- Tasks 2-4 can run in parallel after Task 1
- Task 5 depends on Tasks 2-4 (imports controller references)
- Tasks 6-10 can run in parallel after Task 5 (need route names for Tuyau types)
- For practical parallel execution: Tasks 6-10 can start alongside Tasks 2-5 since they reference route names that only need to exist at runtime, not compile time (the Tuyau types will resolve after `node ace generate:manifest`)
