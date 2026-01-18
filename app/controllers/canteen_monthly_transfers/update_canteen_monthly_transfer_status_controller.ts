import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import CanteenMonthlyTransfer from '#models/canteen_monthly_transfer'
import CanteenPurchase from '#models/canteen_purchase'
import { updateCanteenMonthlyTransferStatusValidator } from '#validators/canteen'

export default class UpdateCanteenMonthlyTransferStatusController {
  async handle({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateCanteenMonthlyTransferStatusValidator)

    const transfer = await CanteenMonthlyTransfer.find(params.id)
    if (!transfer) {
      return response.notFound({ message: 'Transferência não encontrada' })
    }

    const trx = await db.transaction()

    try {
      transfer.status = payload.status
      transfer.processedAt = payload.status === 'TRANSFERRED' ? DateTime.now() : null
      await transfer.useTransaction(trx).save()

      if (payload.status === 'CANCELLED') {
        await CanteenPurchase.query({ client: trx })
          .where('monthlyTransferId', transfer.id)
          .update({ monthlyTransferId: null })
      }

      await trx.commit()

      await transfer.load('canteen')
      await transfer.load('purchases')

      return response.ok(transfer)
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
