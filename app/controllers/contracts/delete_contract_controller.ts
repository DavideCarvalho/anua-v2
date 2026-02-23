import type { HttpContext } from '@adonisjs/core/http'
import Contract from '#models/contract'
import AppException from '#exceptions/app_exception'

export default class DeleteContractController {
  async handle({ params, response }: HttpContext) {
    const { id } = params

    const contract = await Contract.find(id)

    if (!contract) {
      throw AppException.contractNotFound()
    }

    contract.isActive = false
    await contract.save()

    return response.noContent()
  }
}
