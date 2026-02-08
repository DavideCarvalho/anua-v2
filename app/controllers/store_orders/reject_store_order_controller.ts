import type { HttpContext } from '@adonisjs/core/http'
import StoreOrder from '#models/store_order'
import StoreItem from '#models/store_item'
import StudentPayment from '#models/student_payment'
import { rejectStoreOrderValidator } from '#validators/gamification'
import StoreOrderDto from '#models/dto/store_order.dto'

export default class RejectStoreOrderController {
  async handle({ params, request, response }: HttpContext) {
    const { id } = params
    const payload = await request.validateUsing(rejectStoreOrderValidator)

    const order = await StoreOrder.query().where('id', id).preload('items').first()

    if (!order) {
      return response.notFound({ message: 'Store order not found' })
    }

    if (order.status === 'DELIVERED' || order.status === 'CANCELED') {
      return response.badRequest({
        message: `Cannot reject order with status: ${order.status}`,
      })
    }

    // Restore stock for all items
    for (const item of order.items) {
      const storeItem = await StoreItem.find(item.storeItemId)
      if (storeItem && storeItem.totalStock !== null) {
        storeItem.totalStock += item.quantity
        await storeItem.save()
      }
    }

    // If DEFERRED payment, delete the installments from invoice
    if (order.paymentMode === 'DEFERRED' && order.studentPaymentId) {
      const rootPayment = await StudentPayment.find(order.studentPaymentId)

      if (rootPayment) {
        const installmentsQuery = StudentPayment.query()
          .where('studentId', order.studentId)
          .where('type', 'STORE')
          .where('status', 'NOT_PAID')
          .where('contractId', rootPayment.contractId)
          .where('totalAmount', rootPayment.totalAmount)
          .where('installments', rootPayment.installments)
          .whereBetween('installmentNumber', [1, rootPayment.installments])

        if (rootPayment.studentHasLevelId) {
          installmentsQuery.where('studentHasLevelId', rootPayment.studentHasLevelId)
        } else {
          installmentsQuery.whereNull('studentHasLevelId')
        }

        const installments = await installmentsQuery

        for (const payment of installments) {
          await payment.delete()
        }
      }
    }

    order.status = 'REJECTED'
    order.cancellationReason = payload.reason

    await order.save()

    await order.load('student', (studentQuery) => {
      studentQuery.preload('user')
    })

    return response.ok(new StoreOrderDto(order))
  }
}
