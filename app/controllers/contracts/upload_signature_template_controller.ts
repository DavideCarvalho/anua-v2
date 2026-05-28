import type { HttpContext } from '@adonisjs/core/http'
import { v4 as uuidV4 } from 'uuid'
import drive from '@adonisjs/drive/services/main'
import Contract from '#models/contract'
import AppException from '#exceptions/app_exception'
import { validateFileMagicNumber, ALLOWED_PDF_TYPES } from '#lib/file_security'
import { uploadSignatureTemplateValidator } from '#validators/contract_signature_template'
import { getSignedAssetUrl } from '#lib/storage'

const MAX_PDF_BYTES = 10 * 1024 * 1024

export default class UploadSignatureTemplateController {
  async handle({ params, request, response }: HttpContext) {
    const contract = await Contract.find(params.contractId)
    if (!contract) {
      throw AppException.contractNotFound()
    }

    const payload = await request.validateUsing(uploadSignatureTemplateValidator)

    if (payload.fileBase64) {
      const base64 = payload.fileBase64.replace(/^data:application\/pdf;base64,/, '')
      const buffer = Buffer.from(base64, 'base64')

      if (buffer.length > MAX_PDF_BYTES) {
        throw AppException.badRequest('PDF maior que 10MB')
      }

      const detected = validateFileMagicNumber(buffer, ALLOWED_PDF_TYPES)
      if (!detected) {
        throw AppException.badRequest('Conteúdo do arquivo não é um PDF válido')
      }

      if (contract.signatureTemplatePdfKey) {
        try {
          await drive.use().delete(contract.signatureTemplatePdfKey)
        } catch {
          // ignora — arquivo antigo já pode não existir
        }
      }

      const key = `contracts/${contract.id}/signature-template-${uuidV4()}.pdf`
      await drive.use().put(key, buffer, { contentType: 'application/pdf' })
      contract.signatureTemplatePdfKey = key
    }

    if (!contract.signatureTemplatePdfKey) {
      throw AppException.badRequest('PDF do contrato é obrigatório no primeiro envio')
    }

    contract.signatureTemplateSchemas = payload.schemas
    await contract.save()

    const pdfUrl = await getSignedAssetUrl(contract.signatureTemplatePdfKey)

    return response.ok({
      pdfUrl,
      schemas: contract.signatureTemplateSchemas,
    })
  }
}
