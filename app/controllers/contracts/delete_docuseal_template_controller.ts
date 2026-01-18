import type { HttpContext } from '@adonisjs/core/http'
import Contract from '#models/contract'

export default class DeleteDocusealTemplateController {
  async handle({ params, response }: HttpContext) {
    const contract = await Contract.find(params.contractId)
    if (!contract) {
      return response.notFound({ message: 'Contrato não encontrado' })
    }

    contract.docusealTemplateId = null
    await contract.save()

    return response.ok({ success: true })
  }
}
