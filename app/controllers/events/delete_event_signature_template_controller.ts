import type { HttpContext } from '@adonisjs/core/http'
import drive from '@adonisjs/drive/services/main'
import Event from '#models/event'
import AppException from '#exceptions/app_exception'

export default class DeleteEventSignatureTemplateController {
  async handle({ params, response }: HttpContext) {
    const event = await Event.find(params.eventId)
    if (!event) {
      throw AppException.notFound('Evento não encontrado')
    }

    if (event.signatureTemplatePdfKey) {
      try {
        await drive.use().delete(event.signatureTemplatePdfKey)
      } catch {
        // ignora — arquivo já pode não existir
      }
    }

    event.signatureTemplatePdfKey = null
    event.signatureTemplateSchemas = null
    await event.save()

    return response.ok({ success: true })
  }
}
