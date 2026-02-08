import { Job } from '@boringnode/queue'
import { DateTime } from 'luxon'
import GamificationEvent from '#models/gamification_event'
import ProcessGamificationEventJob from './process_gamification_event_job.js'

export default class RetryPendingEventsJob extends Job<void> {
  static readonly jobName = 'RetryPendingEventsJob'

  static options = {
    queue: 'gamification',
    maxRetries: 1,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 1000 },
  }

  async execute(): Promise<void> {
    const startTime = Date.now()

    console.log('[RETRY] Starting pending events retry:', {
      timestamp: new Date().toISOString(),
    })

    // Find events that are not processed and have errors, created more than 10 minutes ago
    const tenMinutesAgo = DateTime.now().minus({ minutes: 10 })

    const pendingEvents = await GamificationEvent.query()
      .where('processed', false)
      .where('createdAt', '<', tenMinutesAgo.toSQL())
      .orderBy('createdAt', 'asc')
      .limit(100)

    console.log(`[RETRY] Found ${pendingEvents.length} pending events to retry`)

    if (pendingEvents.length === 0) {
      return
    }

    let retriedCount = 0
    let failedCount = 0

    for (const event of pendingEvents) {
      try {
        // Reset error and re-enqueue
        event.error = null
        await event.save()

        await ProcessGamificationEventJob.dispatch({
          eventId: event.id,
        })

        console.log(`[RETRY] Retried event ${event.id}`)
        retriedCount++
      } catch (error) {
        console.error(`[RETRY] Failed to retry event ${event.id}:`, error)
        failedCount++
      }
    }

    const duration = Date.now() - startTime

    console.log('[RETRY] Retry completed:', {
      retriedCount,
      failedCount,
      duration: `${duration}ms`,
    })
  }
}
