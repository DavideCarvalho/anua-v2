import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { createContractValidator } from '#validators/contract'
import Contract from '#models/contract'

export default class CreateContractController {
  async handle({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createContractValidator)

    const contract = await Contract.create({
      ...payload,
      endDate: payload.endDate ? DateTime.fromJSDate(payload.endDate) : null,
    })

    return response.created(contract)
  }
}
