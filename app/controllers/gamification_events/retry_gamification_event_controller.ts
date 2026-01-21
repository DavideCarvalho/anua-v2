import type { HttpContext } from '@adonisjs/core/http'
import GamificationEvent from '#models/gamification_event'
import { getQueueManager } from '#services/queue_service'
import ProcessGamificationEventJob from '#jobs/gamification/process_gamification_event_job'

export default class RetryGamificationEventController {
  async handle({ params, response }: HttpContext) {
    const event = await GamificationEvent.find(params.id)

    if (!event) {
      return response.notFound({ message: 'Gamification event not found' })
    }

    // Only allow retry for events with errors (not processed and has error)
    if (event.processed || !event.error) {
      return response.badRequest({
        message: 'Only failed events can be retried',
        processed: event.processed,
      })
    }

    // Reset for reprocessing
    event.processed = false
    event.processedAt = null
    event.error = null

    await event.save()

    // Re-enqueue job for processing
    try {
      const queueManager = await getQueueManager()
      await queueManager.dispatch(ProcessGamificationEventJob, { eventId: event.id })
    } catch (error) {
      console.error('Failed to enqueue gamification event retry:', error)
    }

    await event.load('student', (query) => {
      query.preload('user')
    })

    return response.ok(event)
  }
}
