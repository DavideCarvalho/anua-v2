import type { HttpContext } from '@adonisjs/core/http'
import GamificationEvent from '#models/gamification_event'
import { createGamificationEventValidator } from '#validators/gamification'
import { getQueueManager } from '#services/queue_service'
import ProcessGamificationEventJob from '#jobs/gamification/process_gamification_event_job'

export default class CreateGamificationEventController {
  async handle({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createGamificationEventValidator)

    const event = await GamificationEvent.create({
      studentId: payload.studentId,
      type: payload.type,
      entityType: payload.entityType,
      entityId: payload.entityId,
      metadata: payload.metadata ?? {},
      processed: false,
    })

    // Enqueue job for processing
    try {
      await getQueueManager()
      await ProcessGamificationEventJob.dispatch({ eventId: event.id })
    } catch (error) {
      console.error('Failed to enqueue gamification event:', error)
      // Event is still created, will be retried later
    }

    await event.load('student', (query) => {
      query.preload('user')
    })

    return response.created(event)
  }
}
