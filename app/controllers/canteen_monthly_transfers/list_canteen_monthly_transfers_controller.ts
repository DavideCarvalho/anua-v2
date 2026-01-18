import type { HttpContext } from '@adonisjs/core/http'
import CanteenMonthlyTransfer from '#models/canteen_monthly_transfer'
import { listCanteenMonthlyTransfersValidator } from '#validators/canteen'

export default class ListCanteenMonthlyTransfersController {
  async handle({ request, response }: HttpContext) {
    const payload = await request.validateUsing(listCanteenMonthlyTransfersValidator)

    const page = payload.page ?? 1
    const limit = payload.limit ?? 10

    const query = CanteenMonthlyTransfer.query().preload('canteen').orderBy('year', 'desc')

    if (payload.canteenId) {
      query.where('canteenId', payload.canteenId)
    }

    if (payload.status) {
      query.where('status', payload.status)
    }

    if (payload.month) {
      query.where('month', payload.month)
    }

    if (payload.year) {
      query.where('year', payload.year)
    }

    const transfers = await query.paginate(page, limit)

    return response.ok(transfers)
  }
}
