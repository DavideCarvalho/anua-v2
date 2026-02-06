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
import { marketplaceCheckoutValidator } from '#validators/marketplace'
import { getQueueManager } from '#services/queue_service'
import ReconcilePaymentInvoiceJob from '#jobs/payments/reconcile_payment_invoice_job'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'

export default class MarketplaceCheckoutController {
  async handle({ request, response, effectiveUser }: HttpContext) {
    const user = effectiveUser!
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
    const storeItems = await StoreItem.query().whereIn('id', storeItemIds).whereNull('deletedAt')

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

    // 5. Payment flow - wrapped in transaction
    const paymentMode = payload.paymentMode ?? 'IMMEDIATE'
    const paymentMethod = payload.paymentMethod ?? null
    const now = DateTime.now()

    const trx = await db.transaction()

    try {
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
            await trx.rollback()
            return response.badRequest({
              message: 'Saldo insuficiente',
              balance: previousBalance,
            })
          }

          const newBalance = previousBalance - totalMoney

          const order = await StoreOrder.create(
            {
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
            },
            { client: trx }
          )

          await StudentBalanceTransaction.create(
            {
              studentId,
              amount: totalMoney,
              type: 'STORE_PURCHASE',
              status: 'COMPLETED',
              description: 'Compra na loja',
              previousBalance,
              newBalance,
              storeOrderId: order.id,
              paymentMethod: 'BALANCE',
            },
            { client: trx }
          )

          student.useTransaction(trx)
          student.balance = newBalance
          await student.save()

          await this.createOrderItems(orderItems, order.id, storeItemMap, trx)
          await this.decrementStock(orderItems, storeItemMap, trx)

          await trx.commit()

          await order.load('student')
          await order.load('items', (q) => q.preload('storeItem'))
          await order.load('store')

          return response.created(order)
        }

        // PIX, CASH, CARD
        const order = await StoreOrder.create(
          {
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
          },
          { client: trx }
        )

        await this.createOrderItems(orderItems, order.id, storeItemMap, trx)
        await this.decrementStock(orderItems, storeItemMap, trx)

        await trx.commit()

        await order.load('student')
        await order.load('items', (q) => q.preload('storeItem'))
        await order.load('store')

        return response.created(order)
      }

      // DEFERRED payment
      // Use installments from payload, or calculate from remaining months if spreadAcrossPeriod and no installments specified
      let installments = payload.installments ?? 1

      if (payload.spreadAcrossPeriod && !payload.installments && studentHasLevel.academicPeriodId) {
        const academicPeriod = await AcademicPeriod.find(studentHasLevel.academicPeriodId)
        if (academicPeriod) {
          const remainingMonths = Math.max(
            1,
            Math.ceil(academicPeriod.endDate.diff(now, 'months').months)
          )
          installments = remainingMonths
        }
      }

      const dueDate = now.plus({ months: 1 }).set({ day: 10 })
      const createdPayments: StudentPayment[] = []

      const firstPayment = await StudentPayment.create(
        {
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
        },
        { client: trx }
      )

      const studentPaymentId = firstPayment.id
      createdPayments.push(firstPayment)

      for (let i = 2; i <= installments; i++) {
        const installmentDueDate = dueDate.plus({ months: i - 1 })
        const payment = await StudentPayment.create(
          {
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
          },
          { client: trx }
        )
        createdPayments.push(payment)
      }

      const order = await StoreOrder.create(
        {
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
        },
        { client: trx }
      )

      await this.createOrderItems(orderItems, order.id, storeItemMap, trx)
      await this.decrementStock(orderItems, storeItemMap, trx)

      await trx.commit()

      // Dispatch reconcile job for each payment (after commit)
      try {
        await getQueueManager()
        for (const payment of createdPayments) {
          await ReconcilePaymentInvoiceJob.dispatch({
            paymentId: payment.id,
            triggeredBy: { id: user.id, name: user.name ?? 'Unknown' },
            source: 'marketplace-checkout',
          })
        }
      } catch {
        // Queue not available, payments will be reconciled by scheduler
      }

      await order.load('student')
      await order.load('studentPayment')
      await order.load('items', (q) => q.preload('storeItem'))
      await order.load('store')

      return response.created(order)
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  private async createOrderItems(
    orderItems: Array<{
      storeItemId: string
      quantity: number
      unitPrice: number
      totalPrice: number
    }>,
    orderId: string,
    storeItemMap: Map<string, StoreItem>,
    trx: TransactionClientContract
  ) {
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
    orderItems: Array<{
      storeItemId: string
      quantity: number
      unitPrice: number
      totalPrice: number
    }>,
    storeItemMap: Map<string, StoreItem>,
    trx: TransactionClientContract
  ) {
    for (const item of orderItems) {
      const storeItem = storeItemMap.get(item.storeItemId)!
      if (storeItem.totalStock !== null) {
        storeItem.useTransaction(trx)
        storeItem.totalStock -= item.quantity
        await storeItem.save()
      }
    }
  }
}
