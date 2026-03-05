import type { HttpContext } from '@adonisjs/core/http'
import GenerateMissingPaymentsJob from '#jobs/payments/generate_missing_payments_job'

export default class TriggerMissingPaymentsController {
  async handle({ request, response }: HttpContext) {
    const schoolId = request.input('schoolId') as string | undefined
    await GenerateMissingPaymentsJob.dispatch({ schoolId })

    return response.ok({
      message: 'Geração de mensalidades despachada para a fila',
    })
  }
}
