import type { HttpContext } from '@adonisjs/core/http'
import EventParentalConsent from '#models/event_parental_consent'
import Event from '#models/event'
import Student from '#models/student'
import { DateTime } from 'luxon'
import { nanoid } from 'nanoid'
import db from '@adonisjs/lucid/services/db'
import { requestConsentValidator } from '#validators/consent'

export default class RequestConsentController {
  async handle({ params, request, response }: HttpContext) {
    const { eventId } = params
    const { studentId, responsibleId } = await request.validateUsing(requestConsentValidator)

    const event = await Event.find(eventId)
    if (!event) {
      return response.notFound({ message: 'Evento não encontrado' })
    }

    if (!event.requiresParentalConsent) {
      return response.badRequest({ message: 'Este evento não requer autorização parental' })
    }

    const student = await Student.find(studentId)
    if (!student) {
      return response.notFound({ message: 'Aluno não encontrado' })
    }

    // Verify responsible is linked to student
    const isResponsible = await db
      .from('student_has_responsibles')
      .where('student_id', studentId)
      .where('responsible_id', responsibleId)
      .first()

    if (!isResponsible) {
      return response.badRequest({ message: 'Responsável não vinculado ao aluno' })
    }

    // Check if consent already exists
    const existingConsent = await EventParentalConsent.query()
      .where('eventId', eventId)
      .where('studentId', studentId)
      .first()

    if (existingConsent) {
      return response.badRequest({ message: 'Já existe uma solicitação de autorização para este aluno' })
    }

    const consent = await EventParentalConsent.create({
      id: nanoid(12),
      eventId,
      studentId,
      responsibleId,
      status: 'PENDING',
      requestedAt: DateTime.now(),
      expiresAt: event.startsAt,
    })

    await consent.load('event')
    await consent.load('student', (q) => q.preload('user'))
    await consent.load('responsible')

    return response.created({
      id: consent.id,
      eventId: consent.eventId,
      studentId: consent.studentId,
      responsibleId: consent.responsibleId,
      status: consent.status,
      requestedAt: consent.requestedAt?.toISO(),
      expiresAt: consent.expiresAt?.toISO(),
    })
  }
}
