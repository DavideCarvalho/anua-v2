import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StoreSettlement from '#models/store_settlement'
import { updateStoreSettlementStatusValidator } from '#validators/store'

export default class UpdateStoreSettlementStatusController {
  async handle({ params, request, response, auth }: HttpContext) {
    const settlement = await StoreSettlement.findOrFail(params.id)
    const data = await request.validateUsing(updateStoreSettlementStatusValidator)

    settlement.status = data.status
    if (data.notes) {
      settlement.notes = data.notes
    }

    if (data.status === 'APPROVED') {
      settlement.approvedBy = auth.user!.id
      settlement.approvedAt = DateTime.now()
    }

    if (data.status === 'TRANSFERRED') {
      settlement.processedAt = DateTime.now()
    }

    await settlement.save()
    await settlement.load('store')

    return response.ok(settlement)
  }
}
