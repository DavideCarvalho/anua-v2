# Store Phase 3: Marketplace (Aluno + Responsável) — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let students and parents browse stores, add items to cart, checkout with balance or deferred installments, and track order status.

**Architecture:** New `/api/v1/marketplace/*` API routes with auth-based student resolution. Client-side cart using React context (no DB persistence). New `AlunoLayout` for student pages. Responsável marketplace page added to existing layout.

**Tech Stack:** AdonisJS 6 + Lucid ORM, PostgreSQL, VineJS, React (Inertia.js), shadcn/ui, @tanstack/react-query, Tuyau client

---

## Context for all tasks

**Key data relationships:**
- `Student.id === User.id` (1:1 via `foreignKey: 'id'`)
- `StudentHasResponsible` links `responsibleId` (parent User.id) → `studentId`
- `StudentHasLevel` links student → Level/Class/School (has `contractId` for payments)
- `Store.schoolId` links store to a school
- STUDENT role user → can buy for themselves
- RESPONSIBLE role user → can buy for their children via `StudentHasResponsible`

**Existing code to reuse:**
- `CreateStoreOrderController`: `app/controllers/store_orders/create_store_order_controller.ts` — full order creation logic with IMMEDIATE (balance/cash/card/pix) and DEFERRED (installments) payment flows. The marketplace checkout will follow the same logic but with auth-based student resolution.
- `StoreInstallmentRule` model: queried by `storeId` + `isActive`, ordered by `minAmount` to determine max installments for a given total.
- `createStoreOrderValidator`: `app/validators/gamification.ts` — accepts `studentId`, `schoolId`, `items[]`, `paymentMode`, `paymentMethod`, `installments`, `notes`.
- Existing hooks: `use_store_items.ts`, `use_store_orders.ts` — can reference pattern but marketplace has its own scoped endpoints.
- `ResponsavelLayout`: `inertia/components/layouts/responsavel-layout.tsx` — add "Loja" nav item to `commonNavigation` array.
- No `AlunoLayout` exists yet — create one following `AdminLayout` pattern.

---

## Task 1: Marketplace API controllers — list stores and items

**Files:**
- Create: `app/controllers/marketplace/list_marketplace_stores_controller.ts`
- Create: `app/controllers/marketplace/list_store_items_controller.ts`

### list_marketplace_stores_controller.ts

Resolves student(s) from auth, finds their enrolled schools, returns active stores.

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import Store from '#models/store'
import Student from '#models/student'
import StudentHasLevel from '#models/student_has_level'
import StudentHasResponsible from '#models/student_has_responsible'

export default class ListMarketplaceStoresController {
  async handle({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const studentId = request.input('studentId')

    // Resolve school IDs based on role
    let schoolIds: string[] = []

    if (studentId) {
      // Responsible buying for a specific child
      const relation = await StudentHasResponsible.query()
        .where('responsibleId', user.id)
        .where('studentId', studentId)
        .first()

      if (!relation) {
        return response.forbidden({ message: 'Você não é responsável por este aluno' })
      }

      schoolIds = await this.getStudentSchoolIds(studentId)
    } else {
      // Student buying for themselves
      const student = await Student.find(user.id)
      if (!student) {
        return response.forbidden({ message: 'Usuário não é um aluno' })
      }
      schoolIds = await this.getStudentSchoolIds(user.id)
    }

    if (!schoolIds.length) {
      return response.ok({ data: [] })
    }

    const stores = await Store.query()
      .whereIn('schoolId', schoolIds)
      .whereNull('deletedAt')
      .where('isActive', true)
      .preload('school')
      .orderBy('name', 'asc')

    return response.ok({ data: stores })
  }

  private async getStudentSchoolIds(studentId: string): Promise<string[]> {
    const levels = await StudentHasLevel.query()
      .where('studentId', studentId)
      .whereNull('deletedAt')
      .preload('level', (q) => q.preload('course', (cq) => cq.preload('school')))

    const schoolIds = new Set<string>()
    for (const sl of levels) {
      if (sl.level?.course?.school?.id) {
        schoolIds.add(sl.level.course.school.id)
      }
    }

    // Fallback: check student's direct schoolId via user
    const student = await Student.query()
      .where('id', studentId)
      .preload('user')
      .first()

    if (student?.user?.schoolId) {
      schoolIds.add(student.user.schoolId)
    }

    return Array.from(schoolIds)
  }
}
```

**IMPORTANT:** Before writing this controller, read the existing models to understand how `StudentHasLevel` → `Level` → `Course` → `School` chain works. The chain may differ — adapt the `getStudentSchoolIds` method to match the actual model relationships. Check:
- `app/models/student_has_level.ts` for the `level` relationship
- `app/models/level.ts` for the `course` or `school` relationship
- If `Level` has a direct `schoolId`, use that instead of the chain

### list_store_items_controller.ts

Lists active items for a specific store (marketplace context — only active, in-stock items with availability check).

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StoreItem from '#models/store_item'
import Store from '#models/store'

export default class ListStoreItemsController {
  async handle({ params, request, response }: HttpContext) {
    const { storeId } = params
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const category = request.input('category')

    const store = await Store.query()
      .where('id', storeId)
      .whereNull('deletedAt')
      .where('isActive', true)
      .first()

    if (!store) {
      return response.notFound({ message: 'Loja não encontrada' })
    }

    const now = DateTime.now()
    const query = StoreItem.query()
      .where('storeId', storeId)
      .whereNull('deletedAt')
      .where('isActive', true)
      .where((q) => {
        q.whereNull('availableFrom').orWhere('availableFrom', '<=', now.toSQL()!)
      })
      .where((q) => {
        q.whereNull('availableUntil').orWhere('availableUntil', '>=', now.toSQL()!)
      })
      .orderBy('name', 'asc')

    if (category) query.where('category', category)

    const items = await query.paginate(page, limit)
    return response.ok(items)
  }
}
```

### Commit

```
feat: add marketplace API controllers for stores and items listing
```

---

## Task 2: Marketplace API controllers — installment options and checkout

**Files:**
- Create: `app/controllers/marketplace/get_installment_options_controller.ts`
- Create: `app/controllers/marketplace/marketplace_checkout_controller.ts`

### get_installment_options_controller.ts

Given a storeId and amount, returns available installment tiers.

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import StoreInstallmentRule from '#models/store_installment_rule'

export default class GetInstallmentOptionsController {
  async handle({ request, response }: HttpContext) {
    const storeId = request.input('storeId')
    const amount = request.input('amount')

    if (!storeId || !amount) {
      return response.badRequest({ message: 'storeId e amount são obrigatórios' })
    }

    const rules = await StoreInstallmentRule.query()
      .where('storeId', storeId)
      .where('isActive', true)
      .where('minAmount', '<=', Number(amount))
      .orderBy('maxInstallments', 'desc')

    const maxInstallments = rules.length > 0 ? rules[0].maxInstallments : 1

    // Build options array: [1, 2, ..., maxInstallments]
    const options = Array.from({ length: maxInstallments }, (_, i) => ({
      installments: i + 1,
      installmentAmount: Math.ceil(Number(amount) / (i + 1)),
    }))

    return response.ok({ maxInstallments, options })
  }
}
```

### marketplace_checkout_controller.ts

Handles order creation for both students and parents. Auto-resolves student from auth, validates enrollment, processes payment.

Follow the EXACT same logic as the existing `CreateStoreOrderController` at `app/controllers/store_orders/create_store_order_controller.ts`, but with these differences:
1. If auth user is STUDENT role → set `studentId = auth.user.id`
2. If auth user is RESPONSIBLE role → require `studentId` in body, verify via `StudentHasResponsible`
3. Auto-derive `schoolId` from store
4. Use same validation, stock check, payment flow, order item creation, and stock decrement

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import { DateTime } from 'luxon'
import StoreOrder from '#models/store_order'
import StoreOrderItem from '#models/store_order_item'
import StoreItem from '#models/store_item'
import Store from '#models/store'
import Student from '#models/student'
import StudentPayment from '#models/student_payment'
import StudentBalanceTransaction from '#models/student_balance_transaction'
import StudentHasLevel from '#models/student_has_level'
import StudentHasResponsible from '#models/student_has_responsible'

const marketplaceCheckoutValidator = vine.compile(
  vine.object({
    studentId: vine.string().trim().optional(),
    storeId: vine.string().trim(),
    items: vine.array(
      vine.object({
        storeItemId: vine.string().trim(),
        quantity: vine.number().min(1),
      })
    ),
    paymentMode: vine.enum(['IMMEDIATE', 'DEFERRED']).optional(),
    paymentMethod: vine.enum(['BALANCE', 'PIX', 'CASH', 'CARD']).optional(),
    installments: vine.number().min(1).max(24).optional(),
    notes: vine.string().trim().maxLength(500).optional(),
  })
)

export default class MarketplaceCheckoutController {
  async handle({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const payload = await request.validateUsing(marketplaceCheckoutValidator)

    // 1. Resolve studentId from auth
    let studentId: string

    if (!user.$preloaded.role) {
      await user.load('role')
    }

    const roleName = user.role?.name

    if (roleName === 'STUDENT') {
      studentId = user.id
    } else if (roleName === 'RESPONSIBLE' || roleName === 'STUDENT_RESPONSIBLE') {
      if (!payload.studentId) {
        return response.badRequest({ message: 'studentId é obrigatório para responsáveis' })
      }
      const relation = await StudentHasResponsible.query()
        .where('responsibleId', user.id)
        .where('studentId', payload.studentId)
        .first()

      if (!relation) {
        return response.forbidden({ message: 'Você não é responsável por este aluno' })
      }
      studentId = payload.studentId
    } else {
      return response.forbidden({ message: 'Acesso negado' })
    }

    // 2. Verify store
    const store = await Store.query()
      .where('id', payload.storeId)
      .whereNull('deletedAt')
      .where('isActive', true)
      .first()

    if (!store) {
      return response.notFound({ message: 'Loja não encontrada' })
    }

    const schoolId = store.schoolId

    // 3. Verify enrollment
    const studentHasLevel = await StudentHasLevel.query()
      .where('studentId', studentId)
      .whereNull('deletedAt')
      .orderBy('createdAt', 'desc')
      .first()

    if (!studentHasLevel || !studentHasLevel.contractId) {
      return response.badRequest({
        message: 'Aluno não possui matrícula ativa com contrato',
      })
    }

    const contractId = studentHasLevel.contractId

    // 4. Validate items
    const storeItemIds = payload.items.map((i) => i.storeItemId)
    const storeItems = await StoreItem.query()
      .whereIn('id', storeItemIds)
      .whereNull('deletedAt')

    const storeItemMap = new Map(storeItems.map((item) => [item.id, item]))

    let totalMoney = 0
    const orderItems: Array<{
      storeItemId: string
      quantity: number
      unitPrice: number
      totalPrice: number
    }> = []

    for (const item of payload.items) {
      const storeItem = storeItemMap.get(item.storeItemId)

      if (!storeItem) {
        return response.notFound({ message: `Item não encontrado: ${item.storeItemId}` })
      }

      if (!storeItem.isActive) {
        return response.badRequest({ message: `Item indisponível: ${storeItem.name}` })
      }

      if (storeItem.storeId && storeItem.storeId !== payload.storeId) {
        return response.badRequest({
          message: `Item ${storeItem.name} não pertence a esta loja`,
        })
      }

      if (storeItem.totalStock !== null && storeItem.totalStock < item.quantity) {
        return response.badRequest({
          message: `Estoque insuficiente para ${storeItem.name}. Disponível: ${storeItem.totalStock}`,
        })
      }

      const itemTotal = storeItem.price * item.quantity
      totalMoney += itemTotal

      orderItems.push({
        storeItemId: item.storeItemId,
        quantity: item.quantity,
        unitPrice: storeItem.price,
        totalPrice: itemTotal,
      })
    }

    // 5. Payment flow (same as CreateStoreOrderController)
    const paymentMode = payload.paymentMode ?? 'IMMEDIATE'
    const paymentMethod = payload.paymentMethod ?? null
    const now = DateTime.now()

    let studentPaymentId: string | null = null

    if (paymentMode === 'IMMEDIATE') {
      if (paymentMethod === 'BALANCE') {
        const student = await Student.findOrFail(studentId)
        const latestTransaction = await StudentBalanceTransaction.query()
          .where('studentId', student.id)
          .where('status', 'COMPLETED')
          .orderBy('createdAt', 'desc')
          .first()

        const previousBalance = latestTransaction?.newBalance ?? student.balance ?? 0

        if (previousBalance < totalMoney) {
          return response.badRequest({
            message: 'Saldo insuficiente',
            balance: previousBalance,
          })
        }

        const newBalance = previousBalance - totalMoney

        const order = await StoreOrder.create({
          studentId,
          schoolId,
          storeId: payload.storeId,
          totalPoints: totalMoney,
          totalPrice: totalMoney,
          totalMoney,
          status: 'PENDING_APPROVAL',
          paymentMode: 'IMMEDIATE',
          paymentMethod: 'BALANCE',
          paidAt: now,
          studentNotes: payload.notes ?? null,
        })

        await StudentBalanceTransaction.create({
          studentId,
          amount: totalMoney,
          type: 'STORE_PURCHASE',
          status: 'COMPLETED',
          description: 'Compra na loja',
          previousBalance,
          newBalance,
          storeOrderId: order.id,
          paymentMethod: 'BALANCE',
        })

        student.balance = newBalance
        await student.save()

        await this.createOrderItems(orderItems, order.id, storeItemMap)
        await this.decrementStock(orderItems, storeItemMap)

        await order.load('student')
        await order.load('items', (q) => q.preload('storeItem'))
        await order.load('store')

        return response.created(order)
      }

      // PIX, CASH, CARD
      const order = await StoreOrder.create({
        studentId,
        schoolId,
        storeId: payload.storeId,
        totalPoints: totalMoney,
        totalPrice: totalMoney,
        totalMoney,
        status: 'PENDING_APPROVAL',
        paymentMode: 'IMMEDIATE',
        paymentMethod,
        paidAt: now,
        studentNotes: payload.notes ?? null,
      })

      await this.createOrderItems(orderItems, order.id, storeItemMap)
      await this.decrementStock(orderItems, storeItemMap)

      await order.load('student')
      await order.load('items', (q) => q.preload('storeItem'))
      await order.load('store')

      return response.created(order)
    }

    // DEFERRED payment
    const installments = payload.installments ?? 1
    const dueDate = now.plus({ months: 1 }).set({ day: 10 })

    const firstPayment = await StudentPayment.create({
      studentId,
      amount: installments === 1 ? totalMoney : Math.ceil(totalMoney / installments),
      month: dueDate.month,
      year: dueDate.year,
      type: 'STORE',
      status: 'NOT_PAID',
      totalAmount: totalMoney,
      dueDate,
      installments,
      installmentNumber: 1,
      discountPercentage: 0,
      contractId,
      studentHasLevelId: studentHasLevel.id,
    })

    studentPaymentId = firstPayment.id

    for (let i = 2; i <= installments; i++) {
      const installmentDueDate = dueDate.plus({ months: i - 1 })
      await StudentPayment.create({
        studentId,
        amount:
          i === installments
            ? totalMoney - Math.ceil(totalMoney / installments) * (installments - 1)
            : Math.ceil(totalMoney / installments),
        month: installmentDueDate.month,
        year: installmentDueDate.year,
        type: 'STORE',
        status: 'NOT_PAID',
        totalAmount: totalMoney,
        dueDate: installmentDueDate,
        installments,
        installmentNumber: i,
        discountPercentage: 0,
        contractId,
        studentHasLevelId: studentHasLevel.id,
      })
    }

    const order = await StoreOrder.create({
      studentId,
      schoolId,
      storeId: payload.storeId,
      totalPoints: totalMoney,
      totalPrice: totalMoney,
      totalMoney,
      status: 'PENDING_PAYMENT',
      paymentMode: 'DEFERRED',
      paymentMethod: null,
      studentPaymentId,
      studentNotes: payload.notes ?? null,
    })

    await this.createOrderItems(orderItems, order.id, storeItemMap)
    await this.decrementStock(orderItems, storeItemMap)

    await order.load('student')
    await order.load('studentPayment')
    await order.load('items', (q) => q.preload('storeItem'))
    await order.load('store')

    return response.created(order)
  }

  private async createOrderItems(
    orderItems: Array<{
      storeItemId: string
      quantity: number
      unitPrice: number
      totalPrice: number
    }>,
    orderId: string,
    storeItemMap: Map<string, StoreItem>
  ) {
    for (const item of orderItems) {
      const storeItem = storeItemMap.get(item.storeItemId)!
      await StoreOrderItem.create({
        orderId,
        storeItemId: item.storeItemId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        paymentMode: 'MONEY',
        pointsToMoneyRate: 1,
        pointsPaid: 0,
        moneyPaid: item.totalPrice,
        itemName: storeItem.name,
        itemDescription: storeItem.description,
        itemImageUrl: storeItem.imageUrl,
      })
    }
  }

  private async decrementStock(
    orderItems: Array<{
      storeItemId: string
      quantity: number
      unitPrice: number
      totalPrice: number
    }>,
    storeItemMap: Map<string, StoreItem>
  ) {
    for (const item of orderItems) {
      const storeItem = storeItemMap.get(item.storeItemId)!
      if (storeItem.totalStock !== null) {
        storeItem.totalStock -= item.quantity
        await storeItem.save()
      }
    }
  }
}
```

### Commit

```
feat: add marketplace checkout and installment options controllers
```

---

## Task 3: Marketplace API controllers — order history

**Files:**
- Create: `app/controllers/marketplace/list_my_orders_controller.ts`
- Create: `app/controllers/marketplace/show_my_order_controller.ts`

### list_my_orders_controller.ts

Lists orders for the authenticated student (or selected child for responsible).

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import StoreOrder from '#models/store_order'
import StudentHasResponsible from '#models/student_has_responsible'

export default class ListMyOrdersController {
  async handle({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const studentId = request.input('studentId')
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const status = request.input('status')

    let resolvedStudentId: string

    if (studentId) {
      // Responsible viewing child's orders
      const relation = await StudentHasResponsible.query()
        .where('responsibleId', user.id)
        .where('studentId', studentId)
        .first()

      if (!relation) {
        return response.forbidden({ message: 'Você não é responsável por este aluno' })
      }
      resolvedStudentId = studentId
    } else {
      resolvedStudentId = user.id
    }

    const query = StoreOrder.query()
      .where('studentId', resolvedStudentId)
      .preload('store')
      .preload('items', (q) => q.preload('storeItem'))
      .orderBy('createdAt', 'desc')

    if (status) query.where('status', status)

    const orders = await query.paginate(page, limit)
    return response.ok(orders)
  }
}
```

### show_my_order_controller.ts

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import StoreOrder from '#models/store_order'
import StudentHasResponsible from '#models/student_has_responsible'

export default class ShowMyOrderController {
  async handle({ auth, params, request, response }: HttpContext) {
    const user = auth.user!
    const studentId = request.input('studentId')

    const order = await StoreOrder.query()
      .where('id', params.id)
      .preload('store')
      .preload('student')
      .preload('items', (q) => q.preload('storeItem'))
      .preload('studentPayment')
      .first()

    if (!order) {
      return response.notFound({ message: 'Pedido não encontrado' })
    }

    // Verify access: student owns order or responsible is linked
    if (order.studentId === user.id) {
      return response.ok(order)
    }

    if (studentId) {
      const relation = await StudentHasResponsible.query()
        .where('responsibleId', user.id)
        .where('studentId', order.studentId)
        .first()

      if (relation) {
        return response.ok(order)
      }
    }

    return response.forbidden({ message: 'Acesso negado' })
  }
}
```

### Commit

```
feat: add marketplace order history controllers
```

---

## Task 4: Register marketplace routes + page controllers

**Files:**
- Create: `app/controllers/pages/aluno/show_aluno_loja_page_controller.ts`
- Create: `app/controllers/pages/aluno/show_aluno_loja_store_page_controller.ts`
- Create: `app/controllers/pages/aluno/show_aluno_carrinho_page_controller.ts`
- Create: `app/controllers/pages/aluno/show_aluno_pedidos_page_controller.ts`
- Create: `app/controllers/pages/responsavel/show_responsavel_loja_page_controller.ts`
- Modify: `start/routes.ts`

### Page controllers

All render a simple Inertia page.

**show_aluno_loja_page_controller.ts:** renders `aluno/loja/index`
**show_aluno_loja_store_page_controller.ts:** renders `aluno/loja/store` with `{ storeId: params.id }`
**show_aluno_carrinho_page_controller.ts:** renders `aluno/loja/carrinho`
**show_aluno_pedidos_page_controller.ts:** renders `aluno/loja/pedidos`
**show_responsavel_loja_page_controller.ts:** renders `responsavel/loja`

### Routes

**API routes** — add `registerMarketplaceApiRoutes()` function:

```typescript
function registerMarketplaceApiRoutes() {
  router
    .group(() => {
      router.get('/stores', [ListMarketplaceStoresController]).as('marketplace.stores.index')
      router
        .get('/stores/:storeId/items', [MPListStoreItemsController])
        .as('marketplace.stores.items')
      router
        .get('/installment-options', [GetInstallmentOptionsController])
        .as('marketplace.installmentOptions')
      router.post('/checkout', [MarketplaceCheckoutController]).as('marketplace.checkout')
      router.get('/orders', [ListMyOrdersController]).as('marketplace.orders.index')
      router.get('/orders/:id', [ShowMyOrderController]).as('marketplace.orders.show')
    })
    .prefix('/marketplace')
    .use(middleware.auth())
}
```

Register `registerMarketplaceApiRoutes()` in the API v1 group.

**Web routes** — add aluno group inside `registerPageRoutes()`:

```typescript
// Aluno pages (students)
router
  .group(() => {
    router.get('/loja', [ShowAlunoLojaPageController]).as('loja.index')
    router.get('/loja/:id', [ShowAlunoLojaStorePageController]).as('loja.store')
    router.get('/loja/carrinho', [ShowAlunoCarrinhoPageController]).as('loja.carrinho')
    router.get('/loja/pedidos', [ShowAlunoPedidosPageController]).as('loja.pedidos')
  })
  .prefix('/aluno')
  .use([middleware.auth()])
  .as('aluno')
```

Add responsavel loja route to the existing responsavel group:
```typescript
router.get('/loja', [ShowResponsavelLojaPageController]).as('loja')
```

**IMPORTANT:** The `/aluno/loja/carrinho` route MUST be defined BEFORE `/aluno/loja/:id` to avoid the dynamic `:id` param matching "carrinho". Same for `/aluno/loja/pedidos`. Order:
1. `/loja` (index)
2. `/loja/carrinho` (static)
3. `/loja/pedidos` (static)
4. `/loja/:id` (dynamic — LAST)

### Commit

```
feat: register marketplace API and web routes
```

---

## Task 5: Create AlunoLayout and Cart context

**Files:**
- Create: `inertia/components/layouts/aluno-layout.tsx`
- Create: `inertia/contexts/cart-context.tsx`

### AlunoLayout

Follow `AdminLayout` sidebar pattern. Navigation items:
- Loja (`/aluno/loja`, icon: `ShoppingBag`)
- Carrinho (`/aluno/loja/carrinho`, icon: `ShoppingCart`) — show item count badge
- Meus Pedidos (`/aluno/loja/pedidos`, icon: `ClipboardList`)

```tsx
// Follow admin-layout.tsx pattern exactly:
// - SidebarProvider, Sidebar (collapsible="icon"), SidebarInset
// - Header with SidebarTrigger + ThemeToggle
// - Footer with user info and logout
// - Use CartProvider context wrapper
// - Show cart item count next to Carrinho nav item
```

### Cart context

Client-side cart state using React context. No server persistence.

```tsx
import { createContext, useContext, useState, type PropsWithChildren } from 'react'

interface CartItem {
  storeItemId: string
  storeId: string
  storeName: string
  name: string
  price: number
  imageUrl: string | null
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (storeItemId: string) => void
  updateQuantity: (storeItemId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  /** All items must belong to the same store */
  storeId: string | null
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<CartItem[]>([])

  function addItem(item: Omit<CartItem, 'quantity'>) {
    setItems((prev) => {
      // If cart has items from a different store, clear it first
      if (prev.length > 0 && prev[0].storeId !== item.storeId) {
        return [{ ...item, quantity: 1 }]
      }

      const existing = prev.find((i) => i.storeItemId === item.storeItemId)
      if (existing) {
        return prev.map((i) =>
          i.storeItemId === item.storeItemId ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  function removeItem(storeItemId: string) {
    setItems((prev) => prev.filter((i) => i.storeItemId !== storeItemId))
  }

  function updateQuantity(storeItemId: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(storeItemId)
      return
    }
    setItems((prev) =>
      prev.map((i) => (i.storeItemId === storeItemId ? { ...i, quantity } : i))
    )
  }

  function clearCart() {
    setItems([])
  }

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const storeId = items.length > 0 ? items[0].storeId : null

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice, storeId }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
```

### Commit

```
feat: add AlunoLayout and client-side Cart context
```

---

## Task 6: Marketplace frontend hooks

**Files:**
- Create: `inertia/hooks/queries/use_marketplace.ts`
- Create: `inertia/hooks/mutations/use_marketplace_mutations.ts`

### use_marketplace.ts

```typescript
import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

// Marketplace stores
const $storesRoute = tuyau.api.v1.marketplace.stores.$get
export type MarketplaceStoresResponse = InferResponseType<typeof $storesRoute>

export function useMarketplaceStoresQueryOptions(studentId?: string) {
  return {
    queryKey: ['marketplace', 'stores', studentId],
    queryFn: () => $storesRoute({ query: { studentId } as any }).unwrap(),
  } satisfies QueryOptions
}

// Store items
// Use path params for storeId
export function useMarketplaceItemsQueryOptions(storeId: string, query: { page?: number; limit?: number; category?: string } = {}) {
  const mergedQuery = { page: 1, limit: 20, ...query }
  return {
    queryKey: ['marketplace', 'items', storeId, mergedQuery],
    queryFn: () =>
      tuyau.api.v1.marketplace.stores({ storeId }).items.$get({ query: mergedQuery as any }).unwrap(),
    enabled: !!storeId,
  } satisfies QueryOptions
}

// Installment options
export function useInstallmentOptionsQueryOptions(storeId: string, amount: number) {
  return {
    queryKey: ['marketplace', 'installmentOptions', storeId, amount],
    queryFn: () =>
      tuyau.api.v1.marketplace['installment-options']
        .$get({ query: { storeId, amount } as any })
        .unwrap(),
    enabled: !!storeId && amount > 0,
  } satisfies QueryOptions
}

// My orders
export function useMyOrdersQueryOptions(query: { studentId?: string; status?: string; page?: number; limit?: number } = {}) {
  const mergedQuery = { page: 1, limit: 10, ...query }
  return {
    queryKey: ['marketplace', 'orders', mergedQuery],
    queryFn: () =>
      tuyau.api.v1.marketplace.orders.$get({ query: mergedQuery as any }).unwrap(),
  } satisfies QueryOptions
}
```

**IMPORTANT:** The Tuyau route accessors might not match these exact paths. After routes are registered and `node ace generate:manifest` runs, check `.adonisjs/api.ts` for the actual route structure. Adapt the accessor chains accordingly. If the Tuyau path doesn't work, fall back to `tuyau.$route('api.v1.marketplace.stores.index').$get(...)` pattern.

### use_marketplace_mutations.ts

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'

interface CheckoutPayload {
  studentId?: string
  storeId: string
  items: Array<{ storeItemId: string; quantity: number }>
  paymentMode?: 'IMMEDIATE' | 'DEFERRED'
  paymentMethod?: 'BALANCE' | 'PIX' | 'CASH' | 'CARD'
  installments?: number
  notes?: string
}

export function useMarketplaceCheckout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CheckoutPayload) =>
      tuyau.$route('api.v1.marketplace.checkout').$post(data as any).unwrap(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['marketplace', 'orders'] })
    },
  })
}
```

### Commit

```
feat: add marketplace query and mutation hooks
```

---

## Task 7: Marketplace stores listing page

**Files:**
- Create: `inertia/pages/aluno/loja/index.tsx`
- Create: `inertia/containers/marketplace-stores-container.tsx`

### Page

```tsx
import { Head } from '@inertiajs/react'
import { AlunoLayout } from '../../../components/layouts/aluno-layout'
import { MarketplaceStoresContainer } from '../../../containers/marketplace-stores-container'

export default function AlunoLojaPage() {
  return (
    <AlunoLayout>
      <Head title="Loja" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Loja</h1>
          <p className="text-muted-foreground">Explore as lojas disponíveis</p>
        </div>
        <MarketplaceStoresContainer />
      </div>
    </AlunoLayout>
  )
}
```

### Container

Grid of store cards with name, description, type badge, school name. Each card links to `/aluno/loja/:storeId`.

```tsx
// Uses useMarketplaceStoresQueryOptions()
// Renders a grid of Card components
// Each card shows: store name, description, type badge (Interna/Terceirizada), school name
// Card is clickable, navigates to /aluno/loja/{store.id}
// Loading and empty states
```

### Commit

```
feat: add marketplace stores listing page
```

---

## Task 8: Store detail page with product listing

**Files:**
- Create: `inertia/pages/aluno/loja/store.tsx`
- Create: `inertia/containers/marketplace-store-detail-container.tsx`

### Page

Receives `storeId` prop from page controller.

### Container

Shows store info header + grid of product cards. Each card has: name, description, price, category badge, stock indicator, "Adicionar" button that calls `addItem` from cart context.

```tsx
// Uses useMarketplaceItemsQueryOptions(storeId)
// Store header with name, description, school
// Product grid with Card components
// Each product card: name, price (formatCurrency), category badge, stock status
// "Adicionar ao carrinho" button calls useCart().addItem()
// Show quantity +/- controls if item already in cart
```

### Commit

```
feat: add marketplace store detail page with add-to-cart
```

---

## Task 9: Cart and checkout page

**Files:**
- Create: `inertia/pages/aluno/loja/carrinho.tsx`
- Create: `inertia/containers/marketplace-cart-container.tsx`

### Container

Two sections:
1. **Cart items list** — table/list of items with quantity controls, remove button, subtotal per item, grand total
2. **Checkout form** — payment mode selection (IMMEDIATE/DEFERRED), payment method selection (BALANCE/PIX for immediate), installment options (for deferred — queries installment rules), submit button

```tsx
// Section 1: Cart items
// - useCart() for items, totalPrice, totalItems
// - Each item: name, price, quantity with +/- buttons, subtotal, remove button
// - Empty cart message with link back to /aluno/loja
// - Grand total displayed prominently

// Section 2: Checkout
// - RadioGroup for paymentMode: "Pagar agora" (IMMEDIATE) / "Parcelar" (DEFERRED)
// - If IMMEDIATE: Select for paymentMethod (Saldo, PIX)
//   - Show current balance if BALANCE selected
// - If DEFERRED: useInstallmentOptionsQueryOptions(storeId, totalPrice)
//   - Show installment options as RadioGroup (1x R$100, 2x R$50, 3x R$34...)
// - Notes textarea (optional)
// - "Finalizar Compra" button → useMarketplaceCheckout()
// - On success: clearCart(), navigate to /aluno/loja/pedidos
```

### Commit

```
feat: add marketplace cart and checkout page
```

---

## Task 10: Order history page

**Files:**
- Create: `inertia/pages/aluno/loja/pedidos.tsx`
- Create: `inertia/containers/marketplace-orders-container.tsx`

### Container

Table of orders with: order number, date, items summary, total, status badge.

```tsx
// Uses useMyOrdersQueryOptions()
// Table with columns: Pedido (#number), Data, Itens, Total, Status
// Status badges with same labels/variants as store-owner-orders-container
// Click on order number could expand to show items (or just show inline)
// Status filter dropdown
// Pagination
```

### Commit

```
feat: add marketplace order history page
```

---

## Task 11: Responsável marketplace page + nav update

**Files:**
- Create: `inertia/pages/responsavel/loja.tsx`
- Create: `inertia/containers/responsavel-marketplace-container.tsx`
- Modify: `inertia/components/layouts/responsavel-layout.tsx` — add "Loja" to `commonNavigation`

### Page

Uses existing `ResponsavelLayout`. Shows student selector + marketplace for selected child.

### Container

```tsx
// Student selector at top (reuse existing StudentSelectorWithData pattern)
// When student selected:
//   - Show stores grid (uses useMarketplaceStoresQueryOptions(selectedStudentId))
//   - Each store card links to /responsavel/loja?storeId=X&aluno=Y
//   - Or embeds product listing inline below stores
// For simplicity in Phase 3: just show stores list with link to /aluno/loja/:id
// (parent can browse the same marketplace pages — the checkout handles both roles)
```

### Nav update

Add to `commonNavigation` in `responsavel-layout.tsx`:

```typescript
{ title: 'Loja', route: 'web.responsavel.loja', href: '/responsavel/loja', icon: ShoppingBag },
```

### Commit

```
feat: add responsável marketplace page and nav link
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Marketplace stores + items API | 2 new |
| 2 | Installment options + checkout API | 2 new |
| 3 | Order history API | 2 new |
| 4 | Routes + page controllers | 5 new + 1 modified |
| 5 | AlunoLayout + Cart context | 2 new |
| 6 | Marketplace hooks | 2 new |
| 7 | Stores listing page | 2 new |
| 8 | Store detail + add to cart | 2 new |
| 9 | Cart + checkout page | 2 new |
| 10 | Order history page | 2 new |
| 11 | Responsável marketplace + nav | 2 new + 1 modified |
| **Total** | | **25 new files, 2 modified** |

**Dependencies:**
- Tasks 1-3 can run in parallel (different controller files)
- Task 4 depends on Tasks 1-3 (imports controllers in routes)
- Task 5 is independent (layout + context, no API dependency)
- Task 6 depends on Task 4 (route names for Tuyau hooks)
- Tasks 7-11 depend on Tasks 5+6 (layout + hooks)
- Tasks 7-11 can run in parallel (different files)
