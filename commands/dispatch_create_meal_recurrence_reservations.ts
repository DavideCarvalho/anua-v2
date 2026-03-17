import { BaseCommand } from '@adonisjs/core/ace'
import CreateMealRecurrenceReservationsJob from '#jobs/canteen/create_meal_recurrence_reservations_job'

export default class DispatchCreateMealRecurrenceReservations extends BaseCommand {
  static commandName = 'dispatch:meal-recurrence-reservations'

  static description =
    'Dispara o job que cria reservas de refeições a partir da recorrência configurada (almoço/janta)'

  static options = {
    startApp: true,
  }

  async run() {
    this.logger.info('Dispatching CreateMealRecurrenceReservationsJob...')
    await CreateMealRecurrenceReservationsJob.dispatch({})
    this.logger.success('Job dispatched successfully')
  }
}
