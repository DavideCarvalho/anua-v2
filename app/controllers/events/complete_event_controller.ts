import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import AppException from '#exceptions/app_exception'

export default class CompleteEventController {
  async handle({ params, response }: HttpContext) {
    const { id } = params

    const event = await Event.find(id)

    if (!event) {
      throw AppException.notFound('Evento não encontrado')
    }

    if (event.status !== 'PUBLISHED') {
      throw AppException.badRequest(
        `Não é possível concluir evento com status '${event.status}'. Apenas eventos publicados podem ser concluídos.`
      )
    }

    event.status = 'COMPLETED'
    await event.save()

    await event.load('organizer')
    await event.load('school')

    return response.ok(event)
  }
}
