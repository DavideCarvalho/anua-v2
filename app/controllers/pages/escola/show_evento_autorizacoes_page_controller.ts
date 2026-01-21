import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'

export default class ShowEventoAutorizacoesPageController {
  async handle({ params, inertia, response }: HttpContext) {
    const { eventId } = params

    const event = await Event.find(eventId)
    if (!event) {
      return response.notFound({ message: 'Evento não encontrado' })
    }

    return inertia.render('escola/eventos/autorizacoes', {
      eventId,
    })
  }
}
