import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import StoreOrder from '#models/store_order'
import StoreOrderItem from '#models/store_order_item'
import StoreItem from '#models/store_item'
import Store from '#models/store'
import Student from '#models/student'
import StudentPayment from '#models/student_payment'
import StudentBalanceTransaction from '#models/student_balance_transaction'
import StudentHasLevel from '#models/student_has_level'
import AcademicPeriod from '#models/academic_period'
import StudentHasResponsible from '#models/student_has_responsible'
import User from '#models/user'
import { marketplaceCheckoutValidator } from '#validators/marketplace'
import CheckoutException from '#exceptions/checkout_exception'
import ReconcilePaymentInvoiceJob from '#jobs/payments/reconcile_payment_invoice_job'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import StoreOrderDto from '#models/dto/store_order.dto'

interface CheckoutContext {
  user: User
  studentId: string
  store: Store
  enrollment: StudentHasLevel
  contractId: string
}

interface OrderItemData {
  storeItemId: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface ValidatedCart {
  items: Map<string, StoreItem>
  orderItems: OrderItemData[]
  totalMoney: number
}

export default class MarketplaceCheckoutController {
  async handle({ request, response, effectiveUser }: HttpContext) {
    const payload = await request.validateUsing(marketplaceCheckoutValidator)
    const user = effectiveUser!

    const context = await this.resolveContext(user, payload)
    const validation = await this.validateCartItems(payload.items, context.store.id)

    const order = await this.executeCheckout({
      ...context,
      payload,
      items: validation.items,
      orderItems: validation.orderItems,
      totalMoney: validation.totalMoney,
    })

    return response.created(new StoreOrderDto(order))
  }

  private async resolveContext(
    user: User,
    payload: { storeId: string; studentId?: string }
  ): Promise<CheckoutContext> {
    const studentId = await this.resolveStudentId(user, payload.studentId)
    const store = await this.findActiveStore(payload.storeId)
    const enrollment = await this.findActiveEnrollment(studentId)

    if (!enrollment.contractId) {
      throw CheckoutException.enrollmentNotFound()
    }

    return {
      user,
      studentId,
      store,
      enrollment,
      contractId: enrollment.contractId,
    }
  }

  private async resolveStudentId(user: User, requestedStudentId?: string): Promise<string> {
    if (!user.$preloaded.role) {
      await user.load('role')
    }

    const roleName = user.role?.name

    if (roleName === 'STUDENT') {
      return user.id
    }

    if (roleName === 'RESPONSIBLE' || roleName === 'STUDENT_RESPONSIBLE') {
      if (!requestedStudentId) {
        throw CheckoutException.badRequest('studentId é obrigatório para responsáveis')
      }

      const hasRelation = await StudentHasResponsible.query()
        .where('responsibleId', user.id)
        .where('studentId', requestedStudentId)
        .first()

      if (!hasRelation) {
        throw CheckoutException.unauthorized('Você não é responsável por este aluno')
      }

      return requestedStudentId
    }

    throw CheckoutException.unauthorized('Acesso negado')
  }

  private async findActiveStore(storeId: string): Promise<Store> {
    const store = await Store.query()
      .where('id', storeId)
      .whereNull('deletedAt')
      .where('isActive', true)
      .first()

    if (!store) {
      throw CheckoutException.storeNotFound()
    }

    return store
  }

  private async findActiveEnrollment(studentId: string): Promise<StudentHasLevel> {
    const enrollment = await StudentHasLevel.query()
      .where('studentId', studentId)
      .whereNull('deletedAt')
      .whereNotNull('contractId')
      .orderBy('createdAt', 'desc')
      .first()

    if (!enrollment) {
      throw CheckoutException.enrollmentNotFound()
    }

    return enrollment
  }

  private async validateCartItems(
    cartItems: Array<{ storeItemId: string; quantity: number }>,
    storeId: string
  ): Promise<ValidatedCart> {
    const itemIds = cartItems.map((i) => i.storeItemId)
    const storeItems = await StoreItem.query().whereIn('id', itemIds).whereNull('deletedAt')
    const itemMap = new Map(storeItems.map((item) => [item.id, item]))

    const orderItems: OrderItemData[] = []
    let totalMoney = 0

    for (const cartItem of cartItems) {
      const storeItem = itemMap.get(cartItem.storeItemId)
      this.validateCartItem(storeItem, cartItem, storeId)

      const itemTotal = storeItem!.price * cartItem.quantity
      totalMoney += itemTotal

      orderItems.push({
        storeItemId: cartItem.storeItemId,
        quantity: cartItem.quantity,
        unitPrice: storeItem!.price,
        totalPrice: itemTotal,
      })
    }

    return { items: itemMap, orderItems, totalMoney }
  }

  private validateCartItem(
    storeItem: StoreItem | undefined,
    cartItem: { quantity: number },
    storeId: string
  ): void {
    if (!storeItem) {
      throw CheckoutException.itemNotFound()
    }

    if (!storeItem.isActive) {
      throw CheckoutException.itemUnavailable(storeItem.name)
    }

    if (storeItem.storeId && storeItem.storeId !== storeId) {
      throw CheckoutException.itemWrongStore(storeItem.name)
    }

    if (storeItem.totalStock !== null && storeItem.totalStock < cartItem.quantity) {
      throw CheckoutException.insufficientStock(storeItem.name, storeItem.totalStock)
    }
  }

  private async executeCheckout(params: {
    user: User
    studentId: string
    store: Store
    enrollment: StudentHasLevel
    contractId: string
    payload: any
    items: Map<string, StoreItem>
    orderItems: OrderItemData[]
    totalMoney: number
  }): Promise<StoreOrder> {
    const trx = await db.transaction()

    try {
      const lockedItems = await this.lockItems(trx, params.items)
      this.validateLockedStock(params.orderItems, lockedItems)

      const order = await this.createOrder({ ...params, items: lockedItems }, trx)

      await this.createOrderItems(params.orderItems, order.id, lockedItems, trx)
      await this.decrementStock(params.orderItems, lockedItems, trx)

      await trx.commit()
      await this.dispatchPostCheckoutJobs(order, params.user)
      await this.loadOrderRelations(order)

      return order
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  private async lockItems(
    trx: TransactionClientContract,
    items: Map<string, StoreItem>
  ): Promise<Map<string, StoreItem>> {
    const itemIds = Array.from(items.keys())
    const locked = await StoreItem.query({ client: trx })
      .whereIn('id', itemIds)
      .whereNull('deletedAt')
      .forUpdate()

    return new Map(locked.map((item) => [item.id, item]))
  }

  private validateLockedStock(
    orderItems: OrderItemData[],
    lockedItems: Map<string, StoreItem>
  ): void {
    for (const item of orderItems) {
      const storeItem = lockedItems.get(item.storeItemId)
      if (!storeItem) {
        throw CheckoutException.itemNotFound()
      }
      if (storeItem.totalStock !== null && storeItem.totalStock < item.quantity) {
        throw CheckoutException.insufficientStock(storeItem.name, storeItem.totalStock)
      }
    }
  }

  private async createOrder(
    params: {
      studentId: string
      store: Store
      payload: any
      totalMoney: number
      contractId: string
      enrollment: StudentHasLevel
      items: Map<string, StoreItem>
    },
    trx: TransactionClientContract
  ): Promise<StoreOrder> {
    const paymentMode = params.payload.paymentMode ?? 'IMMEDIATE'
    const paymentMethod = params.payload.paymentMethod ?? null
    const now = DateTime.now()

    if (paymentMode === 'IMMEDIATE') {
      return this.createImmediateOrder(params, paymentMethod, now, trx)
    }

    return this.createDeferredOrder(params, now, trx)
  }

  private async createImmediateOrder(
    params: any,
    paymentMethod: string | null,
    now: DateTime,
    trx: TransactionClientContract
  ): Promise<StoreOrder> {
    const baseOrderData = {
      studentId: params.studentId,
      schoolId: params.store.schoolId,
      storeId: params.payload.storeId,
      totalPoints: params.totalMoney,
      totalPrice: params.totalMoney,
      totalMoney: params.totalMoney,
      status: 'PENDING_APPROVAL' as const,
      paymentMode: 'IMMEDIATE' as const,
      paymentMethod: paymentMethod as 'BALANCE' | 'PIX' | 'CASH' | 'CARD' | null,
      paidAt: now,
      studentNotes: params.payload.notes ?? null,
    }

    if (paymentMethod === 'BALANCE') {
      return this.createBalanceOrder(params, baseOrderData, trx)
    }

    return StoreOrder.create(baseOrderData, { client: trx })
  }

  private async createBalanceOrder(
    params: any,
    baseOrderData: any,
    trx: TransactionClientContract
  ): Promise<StoreOrder> {
    const student = await Student.findOrFail(params.studentId)
    const balance = await this.getStudentBalance(student)

    if (balance < params.totalMoney) {
      throw CheckoutException.insufficientBalance(balance)
    }

    const newBalance = balance - params.totalMoney

    const order = await StoreOrder.create(baseOrderData, { client: trx })

    await StudentBalanceTransaction.create(
      {
        studentId: params.studentId,
        amount: params.totalMoney,
        type: 'STORE_PURCHASE',
        status: 'COMPLETED',
        description: 'Compra na loja',
        previousBalance: balance,
        newBalance,
        storeOrderId: order.id,
        paymentMethod: 'BALANCE',
      },
      { client: trx }
    )

    student.useTransaction(trx)
    student.balance = newBalance
    await student.save()

    return order
  }

  private async getStudentBalance(student: Student): Promise<number> {
    const latestTransaction = await StudentBalanceTransaction.query()
      .where('studentId', student.id)
      .where('status', 'COMPLETED')
      .orderBy('createdAt', 'desc')
      .first()

    return latestTransaction?.newBalance ?? student.balance ?? 0
  }

  private async createDeferredOrder(
    params: any,
    now: DateTime,
    trx: TransactionClientContract
  ): Promise<StoreOrder> {
    const installments = await this.calculateInstallments(params, now)
    const dueDate = now.plus({ months: 1 }).set({ day: 10 })

    const createdPayments = await this.createInstallmentPayments(
      {
        studentId: params.studentId,
        contractId: params.contractId,
        enrollmentId: params.enrollment.id,
        totalMoney: params.totalMoney,
        installments,
        dueDate,
      },
      trx
    )

    const order = await StoreOrder.create(
      {
        studentId: params.studentId,
        schoolId: params.store.schoolId,
        storeId: params.payload.storeId,
        totalPoints: params.totalMoney,
        totalPrice: params.totalMoney,
        totalMoney: params.totalMoney,
        status: 'PENDING_APPROVAL',
        paymentMode: 'DEFERRED',
        paymentMethod: null,
        studentPaymentId: createdPayments[0].id,
        studentNotes: params.payload.notes ?? null,
      },
      { client: trx }
    )

    return order
  }

  private async calculateInstallments(params: any, now: DateTime): Promise<number> {
    let installments = params.payload.installments ?? 1

    if (
      params.payload.spreadAcrossPeriod &&
      !params.payload.installments &&
      params.enrollment.academicPeriodId
    ) {
      const academicPeriod = await AcademicPeriod.find(params.enrollment.academicPeriodId)
      if (academicPeriod) {
        const remainingMonths = Math.max(
          1,
          Math.ceil(academicPeriod.endDate.diff(now, 'months').months)
        )
        installments = remainingMonths
      }
    }

    return installments
  }

  private async createInstallmentPayments(
    params: {
      studentId: string
      contractId: string
      enrollmentId: string
      totalMoney: number
      installments: number
      dueDate: DateTime
    },
    trx: TransactionClientContract
  ): Promise<StudentPayment[]> {
    const payments: StudentPayment[] = []
    const { studentId, contractId, enrollmentId, totalMoney, installments, dueDate } = params

    const baseAmount = Math.ceil(totalMoney / installments)

    for (let i = 1; i <= installments; i++) {
      const installmentDueDate = i === 1 ? dueDate : dueDate.plus({ months: i - 1 })
      const isLastInstallment = i === installments
      const amount = isLastInstallment ? totalMoney - baseAmount * (installments - 1) : baseAmount

      const payment = await StudentPayment.create(
        {
          studentId,
          amount,
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
          studentHasLevelId: enrollmentId,
        },
        { client: trx }
      )

      payments.push(payment)
    }

    return payments
  }

  private async createOrderItems(
    orderItems: OrderItemData[],
    orderId: string,
    storeItemMap: Map<string, StoreItem>,
    trx: TransactionClientContract
  ): Promise<void> {
    for (const item of orderItems) {
      const storeItem = storeItemMap.get(item.storeItemId)!
      await StoreOrderItem.create(
        {
          orderId,
          storeItemId: item.storeItemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          paymentMode: 'MONEY_ONLY',
          pointsToMoneyRate: 1,
          pointsPaid: 0,
          moneyPaid: item.totalPrice,
          itemName: storeItem.name,
          itemDescription: storeItem.description,
          itemImageUrl: storeItem.imageUrl,
        },
        { client: trx }
      )
    }
  }

  private async decrementStock(
    orderItems: OrderItemData[],
    storeItemMap: Map<string, StoreItem>,
    trx: TransactionClientContract
  ): Promise<void> {
    for (const item of orderItems) {
      const storeItem = storeItemMap.get(item.storeItemId)!
      if (storeItem.totalStock !== null) {
        storeItem.useTransaction(trx)
        storeItem.totalStock -= item.quantity
        await storeItem.save()
      }
    }
  }

  private async dispatchPostCheckoutJobs(order: StoreOrder, user: User): Promise<void> {
    if (order.paymentMode !== 'DEFERRED') return

    try {
      if (!order.studentPaymentId) return

      const rootPayment = await StudentPayment.find(order.studentPaymentId)
      if (!rootPayment) return

      const paymentsQuery = StudentPayment.query()
        .where('studentId', order.studentId)
        .where('type', 'STORE')
        .where('status', 'NOT_PAID')
        .where('contractId', rootPayment.contractId)
        .where('totalAmount', rootPayment.totalAmount)
        .where('installments', rootPayment.installments)
        .whereBetween('installmentNumber', [1, rootPayment.installments])

      if (rootPayment.studentHasLevelId) {
        paymentsQuery.where('studentHasLevelId', rootPayment.studentHasLevelId)
      } else {
        paymentsQuery.whereNull('studentHasLevelId')
      }

      const payments = await paymentsQuery

      for (const payment of payments) {
        await ReconcilePaymentInvoiceJob.dispatch({
          paymentId: payment.id,
          triggeredBy: { id: user.id, name: user.name ?? 'Unknown' },
          source: 'marketplace-checkout',
        })
      }
    } catch {
      // Queue not available, payments will be reconciled by scheduler
    }
  }

  private async loadOrderRelations(order: StoreOrder): Promise<void> {
    await order.load('student')
    await order.load('studentPayment')
    await order.load('items', (q) => q.preload('storeItem'))
    await order.load('store')
  }
}
