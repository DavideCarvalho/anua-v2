import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import db from '@adonisjs/lucid/services/db'
import SendEventInvitationsJob from '#jobs/events/send_event_invitations_job'
import EventDto from '#models/dto/event.dto'
import AppException from '#exceptions/app_exception'

type PublishResult =
  | { type: 'not_found' }
  | { type: 'invalid_status'; status: string }
  | { type: 'ok'; event: Event }

export default class PublishEventController {
  async handle({ params, response, auth }: HttpContext) {
    const { id } = params
    const user = auth.user

    const result: PublishResult = await db.transaction(async (trx) => {
      const eventEntity = await Event.query({ client: trx }).where('id', id).first()

      if (!eventEntity) {
        return { type: 'not_found' }
      }

      if (eventEntity.status !== 'DRAFT') {
        return { type: 'invalid_status', status: eventEntity.status }
      }

      eventEntity.status = 'PUBLISHED'
      await eventEntity.save()

      return { type: 'ok', event: eventEntity }
    })

    if (result.type === 'not_found') {
      throw AppException.notFound('Evento não encontrado')
    }

    if (result.type === 'invalid_status') {
      throw AppException.badRequest(
        `Não é possível publicar evento com status '${result.status}'. Apenas eventos em rascunho podem ser publicados.`
      )
    }

    const { event } = result

    await event.load('organizer')
    await event.load('school')
    await event.load('eventAudiences')

    if (!event.requiresParentalConsent) {
      return response.ok(new EventDto(event))
    }

    try {
      await SendEventInvitationsJob.dispatch({
        eventId: event.id,
        triggeredBy: user ? { id: user.id, name: user.name ?? 'Unknown' } : null,
        source: 'events.publish',
      })
    } catch (error) {
      console.error('[EVENT_PUBLISH] Failed to dispatch invitation job:', error)
    }

    return response.ok(new EventDto(event))
  }
}
