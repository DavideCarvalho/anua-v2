import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { updateContractValidator } from '#validators/contract'
import Contract from '#models/contract'

export default class UpdateContractController {
  async handle({ params, request, response }: HttpContext) {
    const { id } = params
    const payload = await request.validateUsing(updateContractValidator)

    const contract = await Contract.find(id)

    if (!contract) {
      return response.notFound({ message: 'Contract not found' })
    }

    const { endDate, ...rest } = payload
    contract.merge({
      ...rest,
      ...(endDate !== undefined && { endDate: endDate ? DateTime.fromJSDate(endDate) : null }),
    })
    await contract.save()

    return contract
  }
}
