import type { HttpContext } from '@adonisjs/core/http'
import Contract from '#models/contract'
import AppException from '#exceptions/app_exception'

export default class DeleteDocusealTemplateController {
  async handle({ params, response }: HttpContext) {
    const contract = await Contract.find(params.contractId)
    if (!contract) {
      throw AppException.contractNotFound()
    }

    contract.docusealTemplateId = null
    await contract.save()

    return response.ok({ success: true })
  }
}
