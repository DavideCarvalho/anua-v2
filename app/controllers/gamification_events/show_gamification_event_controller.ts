import type { HttpContext } from '@adonisjs/core/http'
import GamificationEvent from '#models/gamification_event'
import AppException from '#exceptions/app_exception'

export default class ShowGamificationEventController {
  async handle({ params, response }: HttpContext) {
    const event = await GamificationEvent.query()
      .where('id', params.id)
      .preload('student', (studentQuery) => {
        studentQuery.preload('user')
      })
      .first()

    if (!event) {
      throw AppException.notFound('Evento de gamificação não encontrado')
    }

    return response.ok(event)
  }
}
