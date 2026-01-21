import type { HttpContext } from '@adonisjs/core/http'
import EventParentalConsent from '#models/event_parental_consent'
import { listConsentHistoryValidator } from '#validators/consent'

export default class ListConsentHistoryController {
  async handle({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { page = 1, limit = 20, status, studentId } = await request.validateUsing(
      listConsentHistoryValidator
    )

    const query = EventParentalConsent.query()
      .where('responsibleId', user.id)
      .preload('event', (eventQuery) => {
        eventQuery.preload('school')
      })
      .preload('student', (studentQuery) => {
        studentQuery.preload('user')
      })
      .orderBy('createdAt', 'desc')

    if (status) {
      query.where('status', status)
    }

    if (studentId) {
      query.where('studentId', studentId)
    }

    const consents = await query.paginate(page, limit)

    const formattedData = consents.all().map((consent) => ({
      id: consent.id,
      eventId: consent.eventId,
      studentId: consent.studentId,
      status: consent.status,
      notes: consent.notes,
      requestedAt: consent.requestedAt?.toISO(),
      approvedAt: consent.approvedAt?.toISO(),
      deniedAt: consent.deniedAt?.toISO(),
      expiresAt: consent.expiresAt?.toISO(),
      event: {
        id: consent.event.id,
        title: consent.event.title,
        type: consent.event.type,
        startsAt: consent.event.startsAt?.toISO(),
        school: {
          id: consent.event.school.id,
          name: consent.event.school.name,
        },
      },
      student: {
        id: consent.student.id,
        name: consent.student.user.name,
      },
    }))

    return response.ok({
      data: formattedData,
      meta: {
        total: consents.total,
        page: consents.currentPage,
        lastPage: consents.lastPage,
        perPage: consents.perPage,
      },
    })
  }
}
