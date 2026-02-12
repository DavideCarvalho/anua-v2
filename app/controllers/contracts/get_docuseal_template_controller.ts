import type { HttpContext } from '@adonisjs/core/http'
import Contract from '#models/contract'
import AppException from '#exceptions/app_exception'

export default class GetDocusealTemplateController {
  async handle({ params, response }: HttpContext) {
    const contract = await Contract.find(params.contractId)
    if (!contract) {
      throw AppException.contractNotFound()
    }

    const hasTemplate = !!contract.docusealTemplateId

    return response.ok({
      hasTemplate,
      template: hasTemplate
        ? {
            id: contract.docusealTemplateId,
            name: contract.name,
            createdAt: contract.updatedAt.toISO(),
          }
        : null,
    })
  }
}
