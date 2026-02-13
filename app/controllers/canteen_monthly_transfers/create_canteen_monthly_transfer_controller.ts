import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import Canteen from '#models/canteen'
import CanteenMonthlyTransfer from '#models/canteen_monthly_transfer'
import CanteenPurchase from '#models/canteen_purchase'
import { createCanteenMonthlyTransferValidator } from '#validators/canteen'
import AppException from '#exceptions/app_exception'

export default class CreateCanteenMonthlyTransferController {
  async handle({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createCanteenMonthlyTransferValidator)

    const canteen = await Canteen.find(payload.canteenId)
    if (!canteen) {
      throw AppException.notFound('Cantina não encontrada')
    }

    const existing = await CanteenMonthlyTransfer.query()
      .where('canteenId', payload.canteenId)
      .where('month', payload.month)
      .where('year', payload.year)
      .first()

    if (existing) {
      throw AppException.operationFailedWithProvidedData(409)
    }

    const periodStart = DateTime.fromObject({
      year: payload.year,
      month: payload.month,
      day: 1,
    }).startOf('month')
    const periodEnd = periodStart.endOf('month')

    const startSql = periodStart.toSQL()
    const endSql = periodEnd.toSQL()

    if (!startSql || !endSql) {
      throw AppException.badRequest('Período inválido')
    }

    const purchases = await CanteenPurchase.query()
      .where('canteenId', payload.canteenId)
      .where('status', 'PAID')
      .whereNull('monthlyTransferId')
      .whereBetween('createdAt', [startSql, endSql])

    if (purchases.length === 0) {
      throw AppException.badRequest('Nenhuma compra pendente de repasse')
    }

    const totalAmount = purchases.reduce((total, purchase) => total + purchase.totalAmount, 0)

    const trx = await db.transaction()

    try {
      const transfer = await CanteenMonthlyTransfer.create(
        {
          canteenId: payload.canteenId,
          month: payload.month,
          year: payload.year,
          totalAmount,
          status: 'PENDING',
          processedAt: null,
        },
        { client: trx }
      )

      const purchaseIds = purchases.map((purchase) => purchase.id)

      await CanteenPurchase.query({ client: trx }).whereIn('id', purchaseIds).update({
        monthlyTransferId: transfer.id,
      })

      await trx.commit()

      await transfer.load('canteen')
      await transfer.load('purchases')

      return response.created(transfer)
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
