import type { HttpContext } from '@adonisjs/core/http'
import { randomBytes } from 'node:crypto'
import Contract from '#models/contract'
import { uploadContractDocusealTemplateValidator } from '#validators/contract_docuseal'
import AppException from '#exceptions/app_exception'

export default class UploadDocusealTemplateController {
  async handle({ params, request, response }: HttpContext) {
    const contract = await Contract.find(params.contractId)
    if (!contract) {
      throw AppException.contractNotFound()
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
