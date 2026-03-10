import { test } from '@japa/runner'
import { QueueManager } from '@adonisjs/queue'
import db from '@adonisjs/lucid/services/db'
import GenerateMissingPaymentsJob from '#jobs/payments/generate_missing_payments_job'
import ProcessGamificationEventJob from '#jobs/gamification/process_gamification_event_job'
import SendEventInvitationsJob from '#jobs/events/send_event_invitations_job'

test.group('Queue job dispatch', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  group.each.teardown(() => {
    QueueManager.restore()
  })

  test('dispatches GenerateMissingPaymentsJob to payments queue', async () => {
    const fake = QueueManager.fake()

    await GenerateMissingPaymentsJob.dispatch({ schoolId: 'school-1' })

    fake.assertPushed(GenerateMissingPaymentsJob, {
      queue: 'payments',
      payload: {
        schoolId: 'school-1',
      },
    })
  })

  test('dispatches ProcessGamificationEventJob to gamification queue', async () => {
    const fake = QueueManager.fake()

    await ProcessGamificationEventJob.dispatch({ eventId: 'event-1' })

    fake.assertPushed(ProcessGamificationEventJob, {
      queue: 'gamification',
      payload: {
        eventId: 'event-1',
      },
    })
  })

  test('dispatches SendEventInvitationsJob to notifications queue', async () => {
    const fake = QueueManager.fake()

    await SendEventInvitationsJob.dispatch({
      eventId: 'event-2',
      source: 'events.publish',
      triggeredBy: {
        id: 'user-1',
        name: 'Test User',
      },
    })

    fake.assertPushed(SendEventInvitationsJob, {
      queue: 'notifications',
      payload: {
        eventId: 'event-2',
        source: 'events.publish',
        triggeredBy: {
          id: 'user-1',
          name: 'Test User',
        },
      },
    })
  })
})
