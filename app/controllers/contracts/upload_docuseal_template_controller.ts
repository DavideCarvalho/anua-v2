import type { HttpContext } from '@adonisjs/core/http'
import { randomBytes } from 'node:crypto'
import Contract from '#models/contract'
import { uploadContractDocusealTemplateValidator } from '#validators/contract_docuseal'

export default class UploadDocusealTemplateController {
  async handle({ params, request, response }: HttpContext) {
    const contract = await Contract.find(params.contractId)
    if (!contract) {
      return response.notFound({ message: 'Contrato não encontrado' })
    }

    await request.validateUsing(uploadContractDocusealTemplateValidator)

    const templateId = randomBytes(12).toString('hex')
    contract.docusealTemplateId = templateId
    await contract.save()

    return response.ok({
      templateId,
    })
  }
}
