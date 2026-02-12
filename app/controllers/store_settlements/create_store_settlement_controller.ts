import type { HttpContext } from '@adonisjs/core/http'
import Store from '#models/store'
import StoreOrder from '#models/store_order'
import StoreSettlement from '#models/store_settlement'
import StoreFinancialSettings from '#models/store_financial_settings'
import { createStoreSettlementValidator } from '#validators/store'
import AppException from '#exceptions/app_exception'

export default class CreateStoreSettlementController {
  async handle({ request, response }: HttpContext) {
    const data = await request.validateUsing(createStoreSettlementValidator)

    // Verify store exists and is THIRD_PARTY
    const store = await Store.query().where('id', data.storeId).whereNull('deletedAt').firstOrFail()

    if (store.type !== 'THIRD_PARTY') {
      throw AppException.badRequest('Liquidações são permitidas apenas para lojas de terceiros')
    }

    // Check if settlement already exists for this month/year
    const existing = await StoreSettlement.query()
      .where('storeId', data.storeId)
      .where('month', data.month)
      .where('year', data.year)
      .first()

    if (existing) {
      throw AppException.operationFailedWithProvidedData(409)
    }

    // Get financial settings
    const financialSettings = await StoreFinancialSettings.query()
      .where('storeId', data.storeId)
      .first()

    const platformFeePercentage = financialSettings?.platformFeePercentage ?? 0
    const commissionPercentage = store.commissionPercentage ?? 0

    // Aggregate paid orders for this store/month/year
    const orders = await StoreOrder.query()
      .where('storeId', data.storeId)
      .whereNotNull('paidAt')
      .whereRaw(`EXTRACT(MONTH FROM "paidAt") = ? AND EXTRACT(YEAR FROM "paidAt") = ?`, [
        data.month,
        data.year,
      ])
      .whereNull('settlementId')
      .where('status', 'DELIVERED')

    const totalSalesAmount = orders.reduce((sum, order) => sum + order.totalMoney, 0)
    const commissionAmount = Math.round(totalSalesAmount * (commissionPercentage / 100))
    const platformFeeAmount = Math.round(totalSalesAmount * (platformFeePercentage / 100))
    const transferAmount = totalSalesAmount - commissionAmount - platformFeeAmount

    const settlement = await StoreSettlement.create({
      storeId: data.storeId,
      month: data.month,
      year: data.year,
      totalSalesAmount,
      commissionAmount,
      platformFeeAmount,
      transferAmount,
      status: 'PENDING',
    })

    // Link orders to this settlement
    for (const order of orders) {
      order.settlementId = settlement.id
      await order.save()
    }

    await settlement.load('store')

    return response.created(settlement)
  }
}
