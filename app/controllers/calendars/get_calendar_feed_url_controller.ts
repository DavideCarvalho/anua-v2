import type { HttpContext } from '@adonisjs/core/http'
import AppException from '#exceptions/app_exception'
import StudentHasResponsible from '#models/student_has_responsible'
import CalendarTokenService from '#services/calendar_token_service'

export default class GetCalendarFeedUrlController {
  async handle({ params, effectiveUser, request }: HttpContext) {
    if (!effectiveUser) {
      throw AppException.invalidCredentials()
    }

    const { studentId } = params

    const relation = await StudentHasResponsible.query()
      .where('responsibleId', effectiveUser.id)
      .where('studentId', studentId)
      .first()

    if (!relation) {
      throw AppException.forbidden('Você não tem permissão para gerar o link deste calendário')
    }

    const token = CalendarTokenService.generate(studentId, effectiveUser.id)
    const baseUrl = request.completeUrl().split('/api/')[0]
    const feedUrl = `${baseUrl}/api/v1/calendars/${token}.ics`

    return { feedUrl }
  }
}
