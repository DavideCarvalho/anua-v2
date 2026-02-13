import type { HttpContext } from '@adonisjs/core/http'
import EventParentalConsent from '#models/event_parental_consent'
import Event from '#models/event'
import Student from '#models/student'
import { v7 as uuidv7 } from 'uuid'
import db from '@adonisjs/lucid/services/db'
import { requestConsentValidator } from '#validators/consent'
import AppException from '#exceptions/app_exception'

export default class RequestConsentController {
  async handle({ params, request, response }: HttpContext) {
    const { eventId } = params
    const { studentId, responsibleId } = await request.validateUsing(requestConsentValidator)

    const event = await Event.find(eventId)
    if (!event) {
      throw AppException.notFound('Evento não encontrado')
    }

    if (!event.requiresParentalConsent) {
      throw AppException.badRequest('Este evento não requer autorização parental')
    }

    const student = await Student.find(studentId)
    if (!student) {
      throw AppException.notFound('Aluno não encontrado')
    }

    // Verify responsible is linked to student
    const isResponsible = await db
      .from('student_has_responsibles')
      .where('student_id', studentId)
      .where('responsible_id', responsibleId)
      .first()

    if (!isResponsible) {
      throw AppException.badRequest('Responsável não vinculado ao aluno')
    }

    // Check if consent already exists
    const existingConsent = await EventParentalConsent.query()
      .where('eventId', eventId)
      .where('studentId', studentId)
      .first()

    if (existingConsent) {
      throw AppException.operationFailedWithProvidedData(409)
    }

    const consent = await EventParentalConsent.create({
      id: uuidv7(),
      eventId,
      studentId,
      responsibleId,
      status: 'PENDING',
      expiresAt: event.startDate,
      reminderCount: 0,
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
      createdAt: consent.createdAt?.toISO(),
      expiresAt: consent.expiresAt?.toISO(),
    })
  }
}
