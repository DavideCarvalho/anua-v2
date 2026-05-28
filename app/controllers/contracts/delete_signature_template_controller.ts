import type { HttpContext } from '@adonisjs/core/http'
import drive from '@adonisjs/drive/services/main'
import Contract from '#models/contract'
import AppException from '#exceptions/app_exception'

export default class DeleteSignatureTemplateController {
  async handle({ params, response }: HttpContext) {
    const contract = await Contract.find(params.contractId)
    if (!contract) {
      throw AppException.contractNotFound()
    }

    if (contract.signatureTemplatePdfKey) {
      try {
        await drive.use().delete(contract.signatureTemplatePdfKey)
      } catch {
        // ignora — arquivo já pode não existir
      }
    }

    contract.signatureTemplatePdfKey = null
    contract.signatureTemplateSchemas = null
    await contract.save()

    return response.ok({ success: true })
  }
}
