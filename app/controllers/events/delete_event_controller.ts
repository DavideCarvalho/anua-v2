import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import AppException from '#exceptions/app_exception'

export default class DeleteEventController {
  async handle({ params, response }: HttpContext) {
    const { id } = params

    const event = await Event.find(id)

    if (!event) {
      throw AppException.notFound('Evento não encontrado')
    }

    // Only allow deletion of draft events
    if (event.status !== 'DRAFT') {
      throw AppException.badRequest(
        'Apenas eventos em rascunho podem ser excluídos. Cancele o evento em vez disso.'
      )
    }

    await event.delete()

    return response.ok({ message: 'Evento excluído com sucesso' })
  }
}
