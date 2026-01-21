import type { HttpContext } from '@adonisjs/core/http'
import EventParentalConsent from '#models/event_parental_consent'
import { DateTime } from 'luxon'

export default class ListPendingConsentsController {
  async handle({ auth, response }: HttpContext) {
    const user = auth.user!

    const consents = await EventParentalConsent.query()
      .where('responsibleId', user.id)
      .where('status', 'PENDING')
      .where((query) => {
        query.whereNull('expiresAt').orWhere('expiresAt', '>=', DateTime.now().toSQL())
      })
      .preload('event', (eventQuery) => {
        eventQuery.preload('school')
      })
      .preload('student', (studentQuery) => {
        studentQuery.preload('user')
      })
      .orderBy('expiresAt', 'asc')

    const formattedConsents = consents.map((consent) => ({
      id: consent.id,
      eventId: consent.eventId,
      studentId: consent.studentId,
      status: consent.status,
      createdAt: consent.createdAt?.toISO(),
      expiresAt: consent.expiresAt?.toISO(),
      event: {
        id: consent.event.id,
        title: consent.event.title,
        description: consent.event.description,
        location: consent.event.location,
        type: consent.event.type,
        startDate: consent.event.startDate?.toISO(),
        endDate: consent.event.endDate?.toISO(),
        requiresParentalConsent: consent.event.requiresParentalConsent,
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

    return response.ok(formattedConsents)
  }
}
