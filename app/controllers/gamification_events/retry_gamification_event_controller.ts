import type { HttpContext } from '@adonisjs/core/http'
import GamificationEvent from '#models/gamification_event'
import ProcessGamificationEventJob from '#jobs/gamification/process_gamification_event_job'
import AppException from '#exceptions/app_exception'
import GamificationEventTransformer from '#transformers/gamification_event_transformer'

export default class RetryGamificationEventController {
  async handle({ params, response, logger, serialize }: HttpContext) {
    const event = await GamificationEvent.find(params.id)

    if (!event) {
      throw AppException.notFound('Evento de gamificação não encontrado')
    }

    // Only allow retry for events with errors (not processed and has error)
    if (event.processed || !event.error) {
      throw AppException.badRequest('Apenas eventos com falha podem ser reprocessados')
    }

    // Reset for reprocessing
    event.processed = false
    event.processedAt = null
    event.error = null

    await event.save()

    // Re-enqueue job for processing
    try {
      await ProcessGamificationEventJob.dispatch({ eventId: event.id })
    } catch (error) {
      logger.error({ error }, 'Failed to enqueue gamification event retry')
    }

    await event.load('student', (query) => {
      query.preload('user')
    })

    return response.ok(await serialize(GamificationEventTransformer.transform(event)))
  }
}
