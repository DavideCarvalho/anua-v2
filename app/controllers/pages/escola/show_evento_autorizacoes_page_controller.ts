import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import AppException from '#exceptions/app_exception'

export default class ShowEventoAutorizacoesPageController {
  async handle({ params, inertia }: HttpContext) {
    const { eventId } = params

    const event = await Event.find(eventId)
    if (!event) {
      throw AppException.notFound('Evento não encontrado')
    }

    return inertia.render('escola/eventos/autorizacoes', {
      eventId,
    })
  }
}
