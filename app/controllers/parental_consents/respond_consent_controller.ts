import type { HttpContext } from '@adonisjs/core/http'
import EventParentalConsent from '#models/event_parental_consent'
import { DateTime } from 'luxon'
import { respondConsentValidator } from '#validators/consent'

export default class RespondConsentController {
  async handle({ auth, params, request, response }: HttpContext) {
    const user = auth.user!
    const { id } = params
    const { approved, notes } = await request.validateUsing(respondConsentValidator)

    const consent = await EventParentalConsent.query()
      .where('id', id)
      .where('responsibleId', user.id)
      .first()

    if (!consent) {
      return response.notFound({ message: 'Autorizacao nao encontrada' })
    }

    if (consent.status !== 'PENDING') {
      return response.badRequest({ message: 'Esta autorizacao ja foi respondida' })
    }

    if (consent.expiresAt && consent.expiresAt < DateTime.now()) {
      consent.status = 'EXPIRED'
      await consent.save()
      return response.badRequest({ message: 'Esta autorizacao expirou' })
    }

    consent.status = approved ? 'APPROVED' : 'DENIED'
    consent.respondedAt = DateTime.now()

    if (approved) {
      consent.approvalNotes = notes || null
    } else {
      consent.denialReason = notes || null
    }

    await consent.save()

    return response.ok({
      id: consent.id,
      status: consent.status,
      approvalNotes: consent.approvalNotes,
      denialReason: consent.denialReason,
      respondedAt: consent.respondedAt?.toISO(),
    })
  }
}
