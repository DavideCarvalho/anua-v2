import type { HttpContext } from '@adonisjs/core/http'
import { v4 as uuidV4 } from 'uuid'
import drive from '@adonisjs/drive/services/main'
import Event from '#models/event'
import AppException from '#exceptions/app_exception'
import { validateFileMagicNumber, ALLOWED_PDF_TYPES } from '#lib/file_security'
import { uploadSignatureTemplateValidator } from '#validators/contract_signature_template'
import { getSignedAssetUrl } from '#lib/storage'

const MAX_PDF_BYTES = 10 * 1024 * 1024

export default class UploadEventSignatureTemplateController {
  async handle({ params, request, response }: HttpContext) {
    const event = await Event.find(params.eventId)
    if (!event) {
      throw AppException.notFound('Evento não encontrado')
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

      if (event.signatureTemplatePdfKey) {
        try {
          await drive.use().delete(event.signatureTemplatePdfKey)
        } catch {
          // ignora — arquivo antigo já pode não existir
        }
      }

      const key = `events/${event.id}/signature-template-${uuidV4()}.pdf`
      await drive.use().put(key, buffer, { contentType: 'application/pdf' })
      event.signatureTemplatePdfKey = key
    }

    if (!event.signatureTemplatePdfKey) {
      throw AppException.badRequest('PDF do termo de autorização é obrigatório no primeiro envio')
    }

    event.signatureTemplateSchemas = payload.schemas
    await event.save()

    const pdfUrl = await getSignedAssetUrl(event.signatureTemplatePdfKey)

    return response.ok({
      pdfUrl,
      schemas: event.signatureTemplateSchemas,
    })
  }
}
