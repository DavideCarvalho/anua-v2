import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import AppException from '#exceptions/app_exception'
import { getSignedAssetUrl } from '#lib/storage'

export default class GetEventSignatureTemplateController {
  async handle({ params, response }: HttpContext) {
    const event = await Event.find(params.eventId)
    if (!event) {
      throw AppException.notFound('Evento não encontrado')
    }

    if (!event.signatureTemplatePdfKey || !event.signatureTemplateSchemas) {
      return response.ok({ template: null })
    }

    const pdfUrl = await getSignedAssetUrl(event.signatureTemplatePdfKey)

    return response.ok({
      template: {
        pdfUrl,
        schemas: event.signatureTemplateSchemas,
      },
    })
  }
}
