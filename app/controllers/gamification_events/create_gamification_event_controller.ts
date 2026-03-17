import type { HttpContext } from '@adonisjs/core/http'
import GamificationEvent from '#models/gamification_event'
import { createGamificationEventValidator } from '#validators/gamification'
import ProcessGamificationEventJob from '#jobs/gamification/process_gamification_event_job'
import GamificationEventTransformer from '#transformers/gamification_event_transformer'

export default class CreateGamificationEventController {
  async handle({ request, response, logger, serialize }: HttpContext) {
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
      await ProcessGamificationEventJob.dispatch({ eventId: event.id })
    } catch (error) {
      logger.error({ error }, 'Failed to enqueue gamification event')
    }

    await event.load('student', (query) => {
      query.preload('user')
    })

    return response.created(await serialize(GamificationEventTransformer.transform(event)))
  }
}
