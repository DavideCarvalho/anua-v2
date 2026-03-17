import { BaseCommand } from '@adonisjs/core/ace'
import CreateMealRecurrenceReservations from '#start/jobs/create_meal_recurrence_reservations'

export default class RunMealRecurrenceReservations extends BaseCommand {
  static commandName = 'run:meal-recurrence-reservations'

  static description =
    'Executa o job de recorrência de refeições diretamente (sem fila). Útil para testar.'

  static options = {
    startApp: true,
  }

  async run() {
    this.logger.info('Running CreateMealRecurrenceReservations...')
    const result = await CreateMealRecurrenceReservations.handle()
    this.logger.success(
      `Job completed: ${result.created} created, ${result.skippedExisting} já existiam, ${result.skippedNoMeal} sem refeição no cardápio`
    )
  }
}
