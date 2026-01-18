import type { HttpContext } from '@adonisjs/core/http'
import Contract from '#models/contract'
import { listContractsValidator } from '#validators/contract'

export default class ListContractsController {
  async handle({ request }: HttpContext) {
    const payload = await request.validateUsing(listContractsValidator)

    const page = payload.page || 1
    const limit = payload.limit || 20

    const query = Contract.query()
      .preload('school')
      .preload('paymentDays')
      .preload('interestConfig')
      .preload('earlyDiscounts')
      .orderBy('createdAt', 'desc')

    if (payload.schoolId) {
      query.where('schoolId', payload.schoolId)
    }

    if (payload.academicPeriodId) {
      query.where('academicPeriodId', payload.academicPeriodId)
    }

    if (payload.isActive !== undefined) {
      query.where('isActive', payload.isActive)
    }

    const contracts = await query.paginate(page, limit)

    return contracts
  }
}
