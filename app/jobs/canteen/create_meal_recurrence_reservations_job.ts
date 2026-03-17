import { Job } from '@adonisjs/queue'
import CreateMealRecurrenceReservations from '#start/jobs/create_meal_recurrence_reservations'

export default class CreateMealRecurrenceReservationsJob extends Job {
  static readonly jobName = 'CreateMealRecurrenceReservationsJob'

  static options = {
    queue: 'default',
    maxRetries: 2,
    removeOnComplete: { count: 500 },
    removeOnFail: { count: 100 },
  }

  async execute(): Promise<void> {
    await CreateMealRecurrenceReservations.handle()
  }
}
