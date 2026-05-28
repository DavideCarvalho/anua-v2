import type { HttpContext } from '@adonisjs/core/http'
import Contract from '#models/contract'
import AppException from '#exceptions/app_exception'
import { getSignedAssetUrl } from '#lib/storage'

export default class GetSignatureTemplateController {
  async handle({ params, response }: HttpContext) {
    const contract = await Contract.find(params.contractId)
    if (!contract) {
      throw AppException.contractNotFound()
    }

    if (!contract.signatureTemplatePdfKey || !contract.signatureTemplateSchemas) {
      return response.ok({ template: null })
    }

    const pdfUrl = await getSignedAssetUrl(contract.signatureTemplatePdfKey)

    return response.ok({
      template: {
        pdfUrl,
        schemas: contract.signatureTemplateSchemas,
      },
    })
  }
}
