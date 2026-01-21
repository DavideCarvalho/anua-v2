import type { HttpContext } from '@adonisjs/core/http'
import EventParentalConsent from '#models/event_parental_consent'
import Event from '#models/event'
import { listEventConsentsValidator } from '#validators/consent'

export default class ListEventConsentsController {
  async handle({ params, request, response }: HttpContext) {
    const { eventId } = params
    const { status } = await request.validateUsing(listEventConsentsValidator)

    const event = await Event.find(eventId)
    if (!event) {
      return response.notFound({ message: 'Evento não encontrado' })
    }

    const query = EventParentalConsent.query()
      .where('eventId', eventId)
      .preload('student', (studentQuery) => {
        studentQuery.preload('user')
      })
      .preload('responsible')
      .orderBy('createdAt', 'desc')

    if (status) {
      query.where('status', status)
    }

    const consents = await query

    // Calculate stats
    const stats = {
      total: consents.length,
      pending: consents.filter((c) => c.status === 'PENDING').length,
      approved: consents.filter((c) => c.status === 'APPROVED').length,
      denied: consents.filter((c) => c.status === 'DENIED').length,
      expired: consents.filter((c) => c.status === 'EXPIRED').length,
    }

    const formattedConsents = consents.map((consent) => ({
      id: consent.id,
      studentId: consent.studentId,
      responsibleId: consent.responsibleId,
      status: consent.status,
      approvalNotes: consent.approvalNotes,
      denialReason: consent.denialReason,
      respondedAt: consent.respondedAt?.toISO(),
      expiresAt: consent.expiresAt?.toISO(),
      student: {
        id: consent.student.id,
        name: consent.student.user.name,
        email: consent.student.user.email,
      },
      responsible: {
        id: consent.responsible.id,
        name: consent.responsible.name,
        email: consent.responsible.email,
      },
    }))

    return response.ok({
      event: {
        id: event.id,
        title: event.title,
        startDate: event.startDate?.toISO(),
      },
      stats,
      consents: formattedConsents,
    })
  }
}
